# requirements-status

Check the current requirement gathering progress and continue where left off.

## Usage
/requirements-status
/requirements-current (alias)

## Output
Shows:
- Active requirement name
- Current phase (Discovery/Detail/Complete)
- Progress (e.g., "3/5 questions answered")
- Next step

## Behavior
- If gathering is in progress, continues from last question
- If no active requirement, suggests using /requirements-start
- Shows summary of completed answers so far