# LearnNepal Universal Question Bank Schema v1

## Top-Level Document Structure

Every question bank JSON file must follow this structure:

```json
{
  "classId": "class-12",
  "className": "Class 12",
  "subjectId": "computer-science",
  "subjectName": "Computer Science",
  "languageMode": "english",
  "lastUpdated": "2082-03-15",

  "chapters": [ ... ],
  "exams": [ ... ]
}
```

### `languageMode`

| Value | Meaning |
|-------|---------|
| `"english"` | All content is English-only |
| `"nepali"` | All content is Nepali-only |
| `"bilingual"` | Content has both English and Nepali |

### `chapters` (optional)

```json
"chapters": [
  { "id": "database-management-system", "name": "Database Management System" },
  { "id": "networking", "name": "Networking & Communication" }
]
```

### `exams`

```json
"exams": [
  {
    "year": "2080",
    "examType": { "id": "regular", "name": "Regular Examination" },
    "fullMarks": 75,
    "duration": "3 hours",
    "instructions": [ ... ],
    "sets": [ ... ]
  }
]
```

### `sets`

```json
"sets": [
  {
    "id": "set-a",
    "name": "Set A",
    "groups": [ ... ]
  }
]
```

For single-set exams:
```json
"sets": [
  {
    "id": "single",
    "name": "Question Paper",
    "groups": [ ... ]
  }
]
```

### `groups`

```json
"groups": [
  {
    "id": "group-a",
    "name": "Group A",
    "questionType": "mcq",
    "totalMarks": 10,
    "instruction": "Rewrite the correct option.",
    "questions": [ ... ]
  }
]
```

Bilingual instruction:
```json
"instruction": {
  "english": "Choose the correct answer.",
  "nepali": "सहि उत्तर छान्नुहोस्।"
}
```

---

## Question Structure

```json
{
  "id": "c12-cs-2080-reg-a-a1",
  "questionNumber": "1",
  "marks": 1,
  "chapterId": "database-management-system",
  "tags": ["mcq", "sql"],
  "difficulty": "easy",

  "question": {
    "content": [ ... ]
  },

  "options": [ ... ],
  "correctAnswer": ["b"],

  "answer": {
    "content": [ ... ]
  },

  "subQuestions": [ ... ],
  "choice": { ... }
}
```

---

## Content Block System

All `content` arrays use the universal content block format:

### Text
```json
{ "type": "text", "value": "What is DBMS?" }
```

Bilingual:
```json
{ "type": "text", "english": "What is force?", "nepali": "बल भनेको के हो?" }
```

### Image
```json
{
  "type": "image",
  "src": "assets/question-bank/class-10/science/2080/q5.webp",
  "alt": "Velocity-time graph",
  "caption": "Figure 1"
}
```

Bilingual alt/caption:
```json
{
  "type": "image",
  "src": "...",
  "alt": { "english": "Velocity-time graph", "nepali": "वेग-समय ग्राफ" },
  "caption": { "english": "Figure 1", "nepali": "चित्र १" }
}
```

### Table
```json
{
  "type": "table",
  "headers": ["LAN", "WAN"],
  "rows": [
    ["Small area", "Large area"],
    ["Faster", "Slower"]
  ],
  "caption": "Comparison of LAN and WAN"
}
```

### Formula
```json
{ "type": "formula", "latex": "a = \\frac{v-u}{t}" }
```

### Code
```json
{ "type": "code", "language": "c", "code": "printf(\"Hello\");" }
```

### List
```json
{ "type": "list", "style": "ordered", "items": ["First", "Second"] }
```

### SVG
```json
{ "type": "svg", "src": "assets/.../diagram.svg" }
```

### Divider
```json
{ "type": "divider" }
```

---

## MCQ Options

```json
"options": [
  {
    "id": "a",
    "content": [{ "type": "text", "value": "SELECT" }]
  }
]
```

Shorthand (normalized by engine):
```json
"options": [
  { "id": "a", "text": "SELECT" }
]
```

---

## Subquestions

```json
"subQuestions": [
  {
    "id": "q5-a",
    "number": "a",
    "marks": 2,
    "question": { "content": [ ... ] },
    "answer": { "content": [ ... ] }
  }
]
```

## Internal Choice

```json
"choice": {
  "type": "either-or",
  "instruction": "Answer any ONE",
  "questions": [ { ... }, { ... } ]
}
```
