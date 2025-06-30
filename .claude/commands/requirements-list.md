# requirements-list

List all requirements with their current status.

## Usage
/requirements-list

## Output Format
```
✅ COMPLETE: feature-name (Ready for implementation)
🔴 ACTIVE: current-feature (Discovery 3/5)
⚠️ INCOMPLETE: paused-feature (Paused 3 days ago)
```

## Details Shown
- Status icon (✅ complete, 🔴 active, ⚠️ incomplete)
- Requirement name
- Current state or progress
- Last modified time

## Source
Reads from requirements/index.md and metadata files