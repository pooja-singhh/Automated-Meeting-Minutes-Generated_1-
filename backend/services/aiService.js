const fs = require('fs');
const path = require('path');

// Mock AI service - in production, integrate with actual AI services
class AIService {
  constructor() {
    this.models = {
      summarizer: 'facebook/bart-large-cnn',
      transcription: 'whisper-small'
    };
  }

  // Simulate audio transcription
  async transcribeAudio(filePath) {
    try {
      // In production, integrate with OpenAI Whisper API or similar
      // For now, return a mock transcription
      const mockTranscriptions = [
        "Alice: Welcome everyone to our quarterly review meeting. Let's start with the Q3 project status. Bob: The development team has completed 80% of the mobile app features. Carol: Marketing has finalized the campaign strategy for the product launch. Dave: I suggest we run internal testing by Friday before the client demo next Tuesday.",
        "Emma: Let's discuss the budget allocation for next quarter. Frank: We need to increase the marketing budget by 15%. Grace: I will prepare a detailed comparison report for all departments by Wednesday. Henry: We should schedule a follow-up meeting after Grace shares the report.",
        "Jack: We need to finalize the design specs for the new website. Karen: I will draft the wireframes and share by Wednesday. Leo: I can create the mockups and provide feedback by Friday. Mia: Let's hold a review session on Friday afternoon to consolidate feedback."
      ];
      
      const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        text: randomTranscription,
        confidence: 0.95,
        language: 'en',
        duration: 300 // seconds
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio file');
    }
  }

  // Simulate text summarization
  async summarizeText(text, options = {}) {
    try {
      const {
        maxLength = 180,
        minLength = 30,
        model = this.models.summarizer
      } = options;

      // In production, integrate with OpenAI API or Hugging Face
      // For now, create a simple extractive summary
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const summary = sentences.slice(0, 3).join('. ') + '.';
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        summary: summary,
        originalLength: text.length,
        summaryLength: summary.length,
        compressionRatio: Math.round((1 - summary.length / text.length) * 100),
        model: model,
        processingTime: 1.5
      };
    } catch (error) {
      console.error('Summarization error:', error);
      throw new Error('Failed to summarize text');
    }
  }

  // Extract action items using NLP
  async extractActionItems(text) {
    try {
      // In production, use spaCy or similar NLP library
      // For now, use simple pattern matching
      const actionItems = [];
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      
      const actionKeywords = ['will', 'shall', 'should', 'need', 'must', 'ensure', 'prepare', 'complete', 'finish', 'deliver'];
      const personPattern = /([A-Z][a-z]+):/g;
      
      sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase();
        const hasActionKeyword = actionKeywords.some(keyword => lowerSentence.includes(keyword));
        
        if (hasActionKeyword) {
          const personMatch = sentence.match(personPattern);
          const person = personMatch ? personMatch[0].replace(':', '') : null;
          
          // Extract deadline if present
          const deadlinePattern = /(by|before|until)\s+([A-Za-z0-9\s,]+)/i;
          const deadlineMatch = sentence.match(deadlinePattern);
          const deadline = deadlineMatch ? deadlineMatch[2].trim() : null;
          
          actionItems.push({
            task: sentence.trim(),
            person: person,
            deadline: deadline,
            status: 'pending',
            priority: 'medium'
          });
        }
      });
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        actionItems: actionItems,
        totalFound: actionItems.length,
        processingTime: 1.0
      };
    } catch (error) {
      console.error('Action item extraction error:', error);
      throw new Error('Failed to extract action items');
    }
  }

  // Extract participants from text
  async extractParticipants(text) {
    try {
      // Simple participant extraction using regex
      const participantPattern = /([A-Z][a-z]+):/g;
      const matches = text.match(participantPattern);
      
      if (!matches) {
        return { participants: [], totalFound: 0 };
      }
      
      const participants = [...new Set(matches.map(match => match.replace(':', '')))];
      
      return {
        participants: participants.map(name => ({
          name: name,
          email: `${name.toLowerCase()}@company.com`,
          role: 'Participant'
        })),
        totalFound: participants.length
      };
    } catch (error) {
      console.error('Participant extraction error:', error);
      throw new Error('Failed to extract participants');
    }
  }

  // Process meeting file (audio or text)
  async processMeetingFile(filePath, options = {}) {
    try {
      const fileExt = path.extname(filePath).toLowerCase();
      let transcript = '';
      
      // Handle different file types
      if (['.wav', '.mp3', '.m4a'].includes(fileExt)) {
        // Audio file - transcribe
        const transcriptionResult = await this.transcribeAudio(filePath);
        transcript = transcriptionResult.text;
      } else if (fileExt === '.txt') {
        // Text file - read directly
        transcript = fs.readFileSync(filePath, 'utf8');
      } else {
        throw new Error('Unsupported file type');
      }
      
      // Process the transcript
      const [summaryResult, actionItemsResult, participantsResult] = await Promise.all([
        this.summarizeText(transcript, options.summary),
        this.extractActionItems(transcript),
        this.extractParticipants(transcript)
      ]);
      
      return {
        transcript: transcript,
        summary: summaryResult.summary,
        actionItems: actionItemsResult.actionItems,
        participants: participantsResult.participants,
        metadata: {
          originalLength: transcript.length,
          summaryLength: summaryResult.summaryLength,
          compressionRatio: summaryResult.compressionRatio,
          totalActionItems: actionItemsResult.totalFound,
          totalParticipants: participantsResult.totalFound,
          processingTime: summaryResult.processingTime + actionItemsResult.processingTime,
          model: summaryResult.model,
          confidence: 0.95
        }
      };
    } catch (error) {
      console.error('Meeting processing error:', error);
      throw new Error('Failed to process meeting file');
    }
  }

  // Generate meeting minutes in formatted text
  async generateMeetingMinutes(meetingData) {
    try {
      const {
        title,
        transcript,
        summary,
        actionItems,
        participants,
        meetingDate,
        duration
      } = meetingData;
      
      let minutes = `MEETING MINUTES\n`;
      minutes += `================\n\n`;
      minutes += `Title: ${title}\n`;
      minutes += `Date: ${new Date(meetingDate).toLocaleDateString()}\n`;
      minutes += `Duration: ${duration || 'N/A'} minutes\n\n`;
      
      minutes += `PARTICIPANTS:\n`;
      participants.forEach(participant => {
        minutes += `- ${participant.name}${participant.email ? ` (${participant.email})` : ''}\n`;
      });
      minutes += `\n`;
      
      minutes += `SUMMARY:\n`;
      minutes += `${summary}\n\n`;
      
      if (actionItems && actionItems.length > 0) {
        minutes += `ACTION ITEMS:\n`;
        actionItems.forEach((item, index) => {
          minutes += `${index + 1}. ${item.task}\n`;
          if (item.person) minutes += `   Assigned to: ${item.person}\n`;
          if (item.deadline) minutes += `   Deadline: ${item.deadline}\n`;
          minutes += `   Status: ${item.status}\n`;
          minutes += `   Priority: ${item.priority}\n\n`;
        });
      }
      
      minutes += `\nGenerated on: ${new Date().toLocaleString()}\n`;
      minutes += `Generated by: AMMG (Automated Meeting Minutes Generator)\n`;
      
      return minutes;
    } catch (error) {
      console.error('Minutes generation error:', error);
      throw new Error('Failed to generate meeting minutes');
    }
  }
}

module.exports = new AIService();
