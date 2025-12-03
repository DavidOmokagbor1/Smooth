# Timezone Consistency Fix

## Issue
The code was mixing `datetime.now()` (local time) and `datetime.utcnow()` (UTC time) inconsistently, causing timezone-related logic errors when:
- Evaluating whether tasks are urgent or due soon
- Comparing task `due_date` values against current time
- Filtering and scheduling logic

## Root Cause
- Database timestamps are stored in UTC (standard practice)
- Some code used `datetime.now()` (local time) for time context (correct for user-facing time of day)
- Other code used `datetime.utcnow()` for database comparisons (correct)
- The inconsistency occurred when comparing local time with UTC timestamps

## Solution

### 1. Context Service (`context_service.py`)
**Fixed:** `_get_time_context()` method
- Uses `datetime.now()` for user-facing time context (time of day, hour) - **correct**
- Also provides `current_time_utc` for database comparisons
- Added clear documentation explaining when to use each

### 2. Proactive Service (`proactive_service.py`)
**Fixed:** `generate_proactive_suggestions()` method
- Uses `datetime.now()` for user-facing time of day determination - **correct**
- Uses `datetime.utcnow()` for all database timestamp comparisons:
  - Line 140: `t.due_date < now_utc + timedelta(hours=24)` - **fixed**
  - Line 183: `expires_at = now_utc + timedelta(hours=24)` - **fixed**

### 3. Repositories (`repositories.py`)
**Already correct:** All repository methods use `datetime.utcnow()` for database operations:
- `TaskRepository.update()` - uses `datetime.utcnow()`
- `TaskRepository.mark_complete()` - uses `datetime.utcnow()`
- `UserBehaviorPatternRepository.create_or_update()` - uses `datetime.utcnow()`
- `ProactiveSuggestionRepository.get_active()` - uses `datetime.utcnow()`
- `ProactiveSuggestionRepository.mark_shown()` - uses `datetime.utcnow()`

### 4. AI Service (`ai_service.py`)
**Already correct:** Uses `datetime.utcnow()` for all timestamps

## Rules Established

1. **User-facing time context** (time of day, hour, day of week):
   - Use `datetime.now()` - this is correct because we want the user's local time

2. **Database operations** (timestamps, comparisons, filtering):
   - Use `datetime.utcnow()` - this is correct because database stores UTC

3. **Comparing task due dates**:
   - Always use `datetime.utcnow()` since `due_date` is stored in UTC

## Files Changed

1. ✅ `app/services/context_service.py` - Added UTC time to context, documented timezone usage
2. ✅ `app/services/proactive_service.py` - Fixed to use UTC for database comparisons
3. ✅ All other files already use UTC correctly

## Testing

To verify the fix works:
1. Create a task with a due date
2. Check if urgent task detection works correctly
3. Verify proactive suggestions for due-soon tasks appear correctly
4. Check that time-based pattern learning uses correct time zones

## Summary

✅ **Fixed:** All database timestamp comparisons now use UTC consistently
✅ **Preserved:** User-facing time context still uses local time (correct for UX)
✅ **Documented:** Clear comments explain when to use each timezone

The timezone inconsistency is now resolved!

