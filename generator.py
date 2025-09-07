import streamlit as st
from datetime import datetime
from typing import List, Dict, Optional
import os
import spacy
from pydub import AudioSegment
import whisper
import speech_recognition as sr
from transformers import pipeline

# Load spaCy
@st.cache_resource
def load_spacy_model():
    return spacy.load("en_core_web_sm")

nlp = load_spacy_model()


# File readers
def read_txt(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

def mp3_to_wav(mp3_path, wav_path):
    sound = AudioSegment.from_mp3(mp3_path)
    sound.export(wav_path, format="wav")

def transcribe_audio(file_path, model_name="small"):
    model = whisper.load_model(model_name)
    result = model.transcribe(file_path)
    return result.get("text", "")

def read_meeting_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".txt":
        return read_txt(file_path)
    elif ext in [".wav", ".mp3"]:
        if ext == ".mp3":
            temp_wav = "temp.wav"
            mp3_to_wav(file_path, temp_wav)
            text = transcribe_audio(temp_wav)
            os.remove(temp_wav)
        else:
            text = transcribe_audio(file_path)
        return text
    else:
        raise ValueError(f"Unsupported file type: {ext}")

# PyTorch-only summarizer
@st.cache_resource
def load_summarizer(model_name="facebook/bart-large-cnn"):
    return pipeline("summarization", model=model_name, framework="pt")

def summarize_text(summarizer, text, max_length=180, min_length=30):
    summary = summarizer(text, max_length=max_length, min_length=min_length, do_sample=False)
    return summary[0]["summary_text"]

# Action item extraction
def extract_action_items(text: str) -> List[Dict[str, Optional[str]]]:
    actions = []
    doc = nlp(text)
    for sent in doc.sents:
        sent_text = sent.text.strip()
        if any(word.lower_ in ["will", "shall", "should", "need", "must", "ensure"] for word in sent):
            task = sent_text
            person = None
            deadline = None
            for ent in sent.ents:
                if ent.label_ == "PERSON":
                    person = ent.text
                if ent.label_ == "DATE":
                    deadline = ent.text
            actions.append({"task": task, "person": person, "deadline": deadline})
    return actions

def format_minutes(title: str, summary: str, action_items: List[Dict[str, Optional[str]]], participants: List[str]):
    minutes = f"Meeting Title: {title}\n"
    minutes += f"Participants: {', '.join(participants)}\n\n"
    minutes += "Summary:\n" + summary + "\n\n"
    if action_items:
        minutes += "Action Items:\n"
        for a in action_items:
            task = a.get("task", "")
            person = a.get("person", "")
            deadline = a.get("deadline", "")
            minutes += f"- Task: {task} | Person: {person} | Deadline: {deadline}\n"
    return minutes

# Streamlit App
st.title("Automated Meeting Minutes Generator (PyTorch & NLP)")

uploaded_file = st.file_uploader("Upload meeting file (TXT, WAV, MP3)", type=["txt", "wav", "mp3"])
txt = ""
if uploaded_file:
    file_path = f"temp_{uploaded_file.name}"
    with open(file_path, "wb") as f:
        f.write(uploaded_file.getbuffer())
    try:
        txt = read_meeting_file(file_path)
    except Exception as e:
        st.error(f"Error reading file: {e}")
    finally:
        os.remove(file_path)

col1, col2 = st.columns(2)
with col2:
    ptext = st.text_input("Participants (comma-separated)")
    participants = [p.strip() for p in ptext.split(",") if p.strip()] if ptext else []

    summarizer_model = st.selectbox("Summarization model", ["facebook/bart-large-cnn", "t5-small"], index=0)
    max_len = st.slider("Max summary tokens", min_value=50, max_value=400, value=180)
    min_len = st.slider("Min summary tokens", min_value=10, max_value=100, value=30)

if st.button("Generate Minutes"):
    if not txt or len(txt.strip()) < 10:
        st.error("Please provide a transcript (uploaded or pasted).")
    else:
        with st.spinner("Loading summarizer model (PyTorch)..."):
            summarizer = load_summarizer(summarizer_model)
        with st.spinner("Summarizing transcript..."):
            summary = summarize_text(summarizer, txt, max_length=max_len, min_length=min_len)
        with st.spinner("Extracting action items (NLP)..."):
            actions = extract_action_items(txt)
        title = datetime.now().strftime("%Y-%m-%d %H:%M")
        minutes = format_minutes(title, summary, actions, participants)

        st.subheader("Generated Meeting Minutes")
        st.code(minutes, language="text")

        st.download_button("Download minutes (.txt)", data=minutes, file_name=f"minutes_{title}.txt")

        if actions:
            st.subheader("Detected Action Items")
            for a in actions:
                st.write(f"• Task: {a.get('task')} — Person: {a.get('person')} — Deadline: {a.get('deadline')}")

