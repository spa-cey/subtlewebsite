# requirements-start

Begin gathering requirements for a new feature or enhancement.

## Usage
/requirements-start [description]

## Process
1. Analyze codebase structure and architecture
2. Ask 5 yes/no context discovery questions
3. Perform targeted code analysis based on answers
4. Ask 5 expert yes/no questions with code context
5. Generate comprehensive requirements specification

## Rules
- One question at a time
- All questions are yes/no with smart defaults
- User can answer "idk" to use default
- Wait for all 5 answers before moving to next phase
- Create all files in requirements/YYYY-MM-DD-HHMM-name/

## Files Created
- metadata.json (status tracking)
- 00-initial-request.md (user's request)
- 01-discovery-questions.md (context questions)
- 02-discovery-answers.md (user responses)
- 03-context-findings.md (code analysis)
- 04-detail-questions.md (expert questions)
- 05-detail-answers.md (detailed responses)
- 06-requirements-spec.md (final spec)