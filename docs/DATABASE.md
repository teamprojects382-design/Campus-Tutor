# CampusTutor Database Design

## users

Managed primarily by Supabase Auth.

Application profile information should live in a profiles table.

---

## profiles

Fields:

- id UUID primary key
- full_name
- university
- program
- year_of_study
- avatar_url
- created_at
- updated_at

id references auth.users(id).

---

## study_spaces

Fields:

- id UUID primary key
- user_id UUID
- name
- description
- course_code
- created_at
- updated_at

Indexes:

- user_id
- created_at

---

## documents

Fields:

- id UUID primary key
- study_space_id UUID
- user_id UUID
- name
- original_filename
- mime_type
- file_size
- storage_path
- source_type
- source_url
- processing_status
- processing_error
- created_at
- updated_at

source_type:

- upload
- paste
- url

processing_status:

- pending
- processing
- ready
- failed

Indexes:

- user_id
- study_space_id
- processing_status

---

## document_chunks

Fields:

- id UUID primary key
- document_id UUID
- study_space_id UUID
- content TEXT
- chunk_index INTEGER
- page_number INTEGER nullable
- section TEXT nullable
- metadata JSONB
- embedding VECTOR
- created_at

Indexes:

- document_id
- study_space_id

Vector index should be introduced according to pgvector requirements and actual dataset size.

---

## topics

Fields:

- id UUID primary key
- study_space_id UUID
- name
- description
- created_at

Unique constraint:

study_space_id + normalized topic name

---

## questions

Fields:

- id UUID primary key
- study_space_id UUID
- type
- question
- options JSONB
- correct_answer JSONB
- explanation
- difficulty
- topic_id
- source_references JSONB
- metadata JSONB
- created_at

Types:

- mcq
- short_answer
- true_false
- essay
- flashcard

Difficulty:

- easy
- medium
- hard

---

## quizzes

Fields:

- id UUID primary key
- study_space_id UUID
- user_id UUID
- title
- description
- configuration JSONB
- created_at

---

## quiz_questions

Fields:

- quiz_id UUID
- question_id UUID
- position INTEGER

Composite primary key:

quiz_id + question_id

---

## quiz_attempts

Fields:

- id UUID primary key
- quiz_id UUID
- user_id UUID
- score
- percentage
- started_at
- completed_at

---

## answers

Fields:

- id UUID primary key
- attempt_id UUID
- question_id UUID
- selected_answer JSONB
- is_correct BOOLEAN
- time_taken_seconds
- created_at

Indexes:

- attempt_id
- question_id

---

## mastery

Fields:

- id UUID primary key
- user_id UUID
- study_space_id UUID
- topic_id UUID
- mastery_score
- questions_attempted
- questions_correct
- recent_accuracy
- last_reviewed_at
- updated_at

Unique constraint:

user_id + study_space_id + topic_id

---

## generated_materials

Fields:

- id UUID primary key
- user_id UUID
- study_space_id UUID
- type
- title
- content JSONB
- source_references JSONB
- created_at

---

## recommendations

Fields:

- id UUID primary key
- user_id UUID
- study_space_id UUID
- topic_id UUID nullable
- type
- title
- description
- priority
- status
- created_at
- completed_at

---

## processing_jobs

Fields:

- id UUID primary key
- user_id UUID
- document_id UUID nullable
- job_type
- status
- attempts
- error_message
- started_at
- completed_at
- created_at

---

## usage_events

Fields:

- id UUID primary key
- user_id UUID nullable
- event_name
- metadata JSONB
- created_at

Do not store unnecessary private content in analytics events.

---

# Row Level Security

Private entities must be protected with RLS.

Users must only access records they own or records explicitly shared with them.

Never rely only on frontend authorization.

---

# Important Security Rule

Every resource access must validate ownership.

Example:

A user must not be able to access:

/study/another-users-study-space-id

simply by changing the URL.
