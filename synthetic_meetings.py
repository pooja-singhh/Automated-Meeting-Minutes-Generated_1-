# synthetic_meetings.py
from typing import List, Dict, Optional, Any
import json

# Each meeting is a dict with:
# - transcript: str
# - action_items: List[Dict[str, Optional[str]]]
synthetic_meetings: List[Dict[str, Any]] = [
    {
        "transcript": """
        Alice: We need to finalize the Q2 report by Friday.
        Bob: I will prepare the financial summary.
        Carol: I will review the marketing slides by Thursday.
        Dave: Let's schedule a follow-up meeting next Monday.
        """,
        "action_items": [
            {"task": "Finalize the Q2 report", "person": "Alice", "deadline": "Friday"},
            {"task": "Prepare the financial summary", "person": "Bob", "deadline": None},
            {"task": "Review marketing slides", "person": "Carol", "deadline": "Thursday"},
            {"task": "Schedule follow-up meeting", "person": "Dave", "deadline": "Next Monday"}
        ]
    },
    {
        "transcript": """
        Emma: The client presentation must be ready by Wednesday.
        Frank: I will handle the design slides.
        Grace: I will compile the supporting documents.
        """,
        "action_items": [
            {"task": "Prepare client presentation", "person": "Emma", "deadline": "Wednesday"},
            {"task": "Handle design slides", "person": "Frank", "deadline": None},
            {"task": "Compile supporting documents", "person": "Grace", "deadline": None}
        ]
    },
    {
        "transcript": """
        Henry: We need to brainstorm ideas for the new product launch.
        Isla: I can draft initial concepts by Friday.
        Jack: I will gather customer feedback by Thursday.
        """,
        "action_items": [
            {"task": "Draft initial concepts", "person": "Isla", "deadline": "Friday"},
            {"task": "Gather customer feedback", "person": "Jack", "deadline": "Thursday"}
        ]
    }
]

# Save to JSON file
with open("synthetic_meetings.json", "w") as f:
    json.dump(synthetic_meetings, f, indent=4)

print("Synthetic dataset saved to synthetic_meetings.json")
# generate_synthetic_meetings_txt.py
# synthetic_meetings_txt = """
# === MEETING 1 ===
# Transcript:
# Alice: Welcome everyone. Let's start with the Q3 project review.
# Bob: The development team has completed 80% of the tasks for the mobile app.
# Carol: On the marketing side, we finalized the campaign strategy.
# Dave: For the client demo next Tuesday, I suggest we run internal testing by Friday.
# Alice: Agreed, Dave. Bob, can you ensure all critical bugs are fixed before Friday?
# Bob: Yes, I will prioritize the critical issues.
# Carol: I will prepare the presentation slides and the metrics report by Monday.

# Action Items:
# - Run internal testing for client demo | Person: Dave | Deadline: Friday
# - Fix critical bugs in mobile app | Person: Bob | Deadline: Friday
# - Prepare presentation slides and metrics report | Person: Carol | Deadline: Monday

# Participants: Alice, Bob, Carol, Dave

# === MEETING 2 ===
# Transcript:
# Emma: Let's discuss the budget allocation for next quarter.
# Frank: We need to increase the marketing budget by 15%.
# Grace: I will prepare a detailed comparison report for all departments by Wednesday.
# Henry: We should schedule a follow-up meeting after Grace shares the report.
# Isla: I can coordinate with the finance team to ensure approvals by Thursday.

# Action Items:
# - Prepare department comparison report | Person: Grace | Deadline: Wednesday
# - Coordinate with finance for approvals | Person: Isla | Deadline: Thursday
# - Schedule follow-up meeting | Person: Henry | Deadline: None

# Participants: Emma, Frank, Grace, Henry, Isla

# === MEETING 3 ===
# Transcript:
# Jack: We need to finalize the design specs for the new website.
# Karen: I will draft the wireframes and share by Wednesday.
# Leo: I can create the mockups and provide feedback by Friday.
# Mia: Let's hold a review session on Friday afternoon to consolidate feedback.
# Jack: Sounds good, Mia. Also, ensure all assets are optimized for mobile devices.

# Action Items:
# - Draft wireframes | Person: Karen | Deadline: Wednesday
# - Create mockups and provide feedback | Person: Leo | Deadline: Friday
# - Hold review session | Person: Mia | Deadline: Friday afternoon
# - Optimize assets for mobile devices | Person: Jack | Deadline: None

# Participants: Jack, Karen, Leo, Mia

# """

# # Save to TXT file
# with open("synthetic_meetings.txt", "w", encoding="utf-8") as f:
#     f.write(synthetic_meetings_txt)

# print("Synthetic meetings saved as synthetic_meetings.txt")
