# Feature Specification: Enhance Quiz Section

**Feature Branch**: `006-enhance-quiz-section`  
**Created**: 2026-05-13  
**Status**: Draft  
**Input**: User description: "Enhance quiz section. It is currently stuck when there are less than ten words. Make sure that the quiz just shows an error in case there are less than words asking user to add atleast ten. Also the quiz should be in the form where there are four options given, one of them should be the right answer (the meaning of the word). It should be generated at random, and user should get to know the right answers towards the end to verify his memory."

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Minimum Word Count Guard (Priority: P1)

A learner opens the Quiz section but has fewer than 10 words in their vocabulary list. Instead of the quiz freezing, hanging, or showing a blank screen, the system immediately presents a clear, friendly message explaining that at least 10 words are required and directing the learner to add more words before trying again.

**Why this priority**: The current frozen/stuck state is a blocking bug that prevents any quiz usage for new or low-vocabulary learners. Fixing this unblocks all other quiz improvements.

**Independent Test**: Can be fully tested by navigating to the Quiz section with fewer than 10 words in the word list. Delivers value by eliminating the confusing stuck state and guiding the user to take action.

**Acceptance Scenarios**:

1. **Given** a learner has 0 words in their vocabulary, **When** they navigate to the Quiz section, **Then** an error message is displayed stating they need at least 10 words, no quiz starts, and the page does not freeze.
2. **Given** a learner has between 1 and 9 words, **When** they navigate to the Quiz section, **Then** the same minimum-word-count message is shown with the current count and the required count of 10.
3. **Given** a learner has exactly 10 words, **When** they navigate to the Quiz section, **Then** the quiz starts normally without any error.

---

### User Story 2 - Multiple-Choice Four-Option Quiz (Priority: P2)

A learner with at least 10 words starts a quiz session. Each question presents a German word and four answer options — one is the correct meaning of the word and three are plausible distractors drawn randomly from other words in the learner's vocabulary. The learner selects one option per question.

**Why this priority**: The four-option multiple-choice format is the core learning mechanic requested. It transforms the quiz from its current form into an active recall exercise that is more engaging and pedagogically sound.

**Independent Test**: Can be tested end-to-end with a vocabulary of exactly 10+ words. The quiz should display questions one at a time, each with exactly four options, only one of which is the correct answer.

**Acceptance Scenarios**:

1. **Given** the quiz has started, **When** a question is displayed, **Then** exactly one German word is shown as the prompt and exactly four answer options are displayed.
2. **Given** a question is displayed, **When** the options are inspected, **Then** exactly one option matches the correct meaning and the remaining three are distinct meanings from other words in the learner's vocabulary.
3. **Given** the options for a question are generated, **When** checked across multiple quiz sessions, **Then** the correct answer position (first, second, third, or fourth) varies randomly and is not always in the same slot.
4. **Given** the learner selects an answer, **When** any option is clicked, **Then** the selection is recorded and the learner advances to the next question without immediate feedback on correctness.

---

### User Story 3 - End-of-Quiz Results Review (Priority: P3)

After answering all questions in a quiz session, the learner is presented with a summary screen that shows every question alongside the option they selected and the correct answer. This allows the learner to review their performance and verify their memory.

**Why this priority**: Deferred feedback reinforces memory consolidation (the "testing effect"). Showing all answers at the end encourages the learner to commit to their choices rather than guessing randomly, making the quiz a genuine memory-verification tool.

**Independent Test**: Can be tested by completing a full quiz session and verifying the results screen. Delivers standalone value as the closure and learning-reinforcement step of the quiz flow.

**Acceptance Scenarios**:

1. **Given** the learner has answered all questions, **When** the last answer is submitted, **Then** a results/review screen is shown summarising every question.
2. **Given** the results screen is displayed, **When** each question is reviewed, **Then** the German word, the learner's selected answer, and the correct answer are all clearly visible.
3. **Given** the results screen is displayed, **When** a learner's answer matches the correct answer, **Then** that question is visually marked as correct (e.g., highlighted differently from incorrect answers).
4. **Given** the results screen is displayed, **When** the learner has finished reviewing, **Then** there is an option to restart the quiz or return to the word list.

---

### Edge Cases

- What happens when the vocabulary list drops below 10 words while a quiz session is in progress (e.g., user deletes words in another tab)? — The in-progress session completes normally; the guard only applies at quiz start.
- How does the system handle a vocabulary of exactly 10 words where distractors must be chosen? — With exactly 10 words, the three distractor options are drawn from the remaining 9 words, ensuring no duplicate options appear.
- What if two words in the vocabulary have identical meanings? — The system treats each word as a distinct entry; duplicate-meaning distractors are allowed since they are separate vocabulary items.
- How does the system generate random questions and random option order? — Questions are drawn in a randomised order from the full vocabulary each quiz session; no question is repeated in the same session.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST display a clear error message when the learner attempts to start a quiz with fewer than 10 words in their vocabulary list.
- **FR-002**: The error message MUST state the minimum required word count (10) and the learner's current word count.
- **FR-003**: The system MUST NOT enter a frozen, hanging, or blank state when the word count is below 10.
- **FR-004**: Each quiz question MUST present exactly one German word prompt and exactly four selectable answer options.
- **FR-005**: Exactly one of the four answer options MUST be the correct meaning of the displayed German word.
- **FR-006**: The three distractor options MUST be drawn randomly from the meanings of other words in the learner's vocabulary (not repeated, not identical to the correct answer).
- **FR-007**: The position of the correct answer among the four options MUST be randomised per question.
- **FR-008**: Questions MUST be presented in a randomised order each quiz session.
- **FR-009**: The learner MUST NOT receive correctness feedback during the quiz (no immediate right/wrong indication after selecting an option).
- **FR-010**: After all questions are answered, the system MUST display a results review screen.
- **FR-011**: The results review screen MUST show, for every question: the German word, the learner's chosen answer, and the correct answer.
- **FR-012**: The results review screen MUST visually distinguish correctly answered questions from incorrectly answered ones.
- **FR-013**: The results review screen MUST provide a way for the learner to restart the quiz or return to the word list.

### Key Entities

- **Quiz Session**: A single playthrough consisting of a set of questions derived from the learner's current vocabulary. Has a start event, a sequence of answered questions, and a results state.
- **Quiz Question**: One item in a session — consists of a word prompt, four answer options (one correct, three distractors), and the learner's selected answer.
- **Word**: An entry in the learner's vocabulary list with at least a German term and its meaning/translation.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A learner with fewer than 10 words sees an informative error message within 1 second of navigating to the Quiz section — the page never freezes.
- **SC-002**: A learner with 10 or more words can complete a full quiz session from start to results screen without encountering any blocking errors.
- **SC-003**: Every quiz question displays exactly 4 options, with the correct answer position varying across questions in at least 75% of sessions (verified by examining option layouts over multiple runs).
- **SC-004**: The results review screen shows 100% of questions answered in the session, each with the learner's response and the correct answer.
- **SC-005**: Learners can identify their score (number of correct answers) from the results screen without additional navigation.

---

## Assumptions

- The learner's vocabulary list is the single source of words used both as question prompts and as distractor sources; no external word bank is used.
- "Meaning" refers to the primary translation/meaning stored for each word in the existing data model — no new fields need to be added.
- The quiz does not persist historical session scores to long-term storage in this iteration; results are only shown for the current session.
- Mobile responsiveness is desirable but not a hard requirement for this iteration.
- The four-option format applies to all questions in a session; mixed formats (e.g., fill-in-the-blank) are out of scope.
- Accessibility (keyboard navigation, screen-reader labels) follows the existing application standard — no additional accessibility audit is required for this feature.
