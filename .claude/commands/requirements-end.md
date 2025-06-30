# requirements-end

Finalize the current requirement gathering session.

## Usage
/requirements-end

## Options
1. **Complete**: Generate final spec with available information
2. **Incomplete**: Mark as paused for later continuation
3. **Cancel**: Delete requirement and all associated files

## Behavior
- Clears .current-requirement file
- Updates metadata.json with final status
- If complete, generates requirements spec
- Updates requirements/index.md with summary