# Commit Structure - Smooth Repository

## Repository Organization

This is a **unified repository** containing two separate projects:

1. **AIVoiceAssistant/** - Web-based AI Voice Assistant
2. **Lazy/** - Mobile AI Executive Function Companion

## Commit Naming Convention

To maintain clarity and prevent mix-ups, commits are prefixed with the project name:

- `Lazy: <description>` - Changes to Lazy project only
- `AIVoiceAssistant: <description>` - Changes to AIVoiceAssistant project only
- `Unified: <description>` - Changes affecting both projects (e.g., README, .gitignore)

## Current Status

### Recent Commits (All Lazy Project)
- ✅ `971de03` - Lazy: Add tap-to-record, task detail modal, reminders, and proactive AI
- ✅ `1559606` - Refactor task management features for improved user experience
- ✅ `c85a617` - Refactor time context handling for improved accuracy and clarity
- ✅ `3dd1133` - Enhance task management and route planning features

### AIVoiceAssistant Status
- Last modified in initial commit: `59ee26d`
- No recent changes - project is stable

## Verification

All recent commits only modify files in the `Lazy/` directory. No cross-project contamination.

## Best Practices

1. **Always prefix commits** with project name
2. **Verify file paths** before committing
3. **Use `git status`** to check which project is being modified
4. **Keep projects independent** - changes to one should not affect the other

## Checking for Mix-ups

To verify no mix-up occurred:

```bash
# Check what files changed in a commit
git show --name-only <commit-hash>

# Verify all changes are in correct project directory
git diff HEAD~1 HEAD --name-only | grep -v "^Lazy/"  # Should be empty for Lazy commits
git diff HEAD~1 HEAD --name-only | grep -v "^AIVoiceAssistant/"  # Should be empty for AIVoiceAssistant commits
```

