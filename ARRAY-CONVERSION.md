# Array Conversion Guide

This guide documents the conversion of numbered suffix translation keys to arrays.

## Overview

The translation files contain numbered suffix patterns like `instructions1`, `instructions2`, etc. These should be converted to arrays for better maintainability and cleaner code.

## Identified Patterns

### 1. Breathing Exercise Steps

- **Base key:** `activities_breathing_step`
- **Count:** 3 items
- **Lines:** 28-30 in both en.json and he.json
- **Keys:** `step1`, `step2`, `step3`

**Before:**

```json
"activities_breathing_step1": "Inhale through your nose for 4 seconds",
"activities_breathing_step2": "Hold your breath gently for 7 seconds — allow your body to soften",
"activities_breathing_step3": "Exhale slowly through your mouth for 8 seconds, imagining stress leaving your body"
```

**After:**

```json
"activities_breathing_step": [
  "Inhale through your nose for 4 seconds",
  "Hold your breath gently for 7 seconds — allow your body to soften",
  "Exhale slowly through your mouth for 8 seconds, imagining stress leaving your body"
]
```

### 2-6. Stretching Exercise Instructions

Each stretching exercise has 4 numbered instructions:

#### Neck Rolls

- **Base key:** `activities_stretching_exercises_neckRolls_instructions`
- **Count:** 4 items
- **Lines:** 48-51

#### Shoulder Shrugs

- **Base key:** `activities_stretching_exercises_shoulderShrugs_instructions`
- **Count:** 4 items
- **Lines:** 54-57

#### Arm Circles

- **Base key:** `activities_stretching_exercises_armCircles_instructions`
- **Count:** 4 items
- **Lines:** 60-63

#### Side Stretch

- **Base key:** `activities_stretching_exercises_sideStretch_instructions`
- **Count:** 4 items
- **Lines:** 66-69

#### Forward Fold

- **Base key:** `activities_stretching_exercises_forwardFold_instructions`
- **Count:** 4 items
- **Lines:** 72-75

## Scripts

### 1. analyze-numbered-keys.js (Dry Run)

Analyzes translation files and shows what will be converted without modifying files.

**Usage:**

```bash
node analyze-numbered-keys.js
```

**Output:**

- Lists all numbered patterns found
- Shows line numbers
- Previews before/after conversion
- Provides summary statistics

### 2. convert-numbered-keys-to-arrays.js (Conversion)

Performs the actual conversion on translation files.

**Usage:**

```bash
node convert-numbered-keys-to-arrays.js
```

**Features:**

- Creates `.backup` files before modification
- Converts all numbered patterns to arrays
- Preserves JSON formatting
- Shows detailed conversion log

## Impact Summary

### Files Affected

- `/home/roib/github/CALMe/messages/en.json`
- `/home/roib/github/CALMe/messages/he.json`

### Statistics

- **Patterns found:** 6
- **Keys to convert:** 23
- **Keys after conversion:** 6
- **Net reduction:** 17 keys (per file)

## Code Changes Required

After conversion, update your code to access array values:

### Before:

```typescript
const step1 = messages.activities_breathing_step1;
const step2 = messages.activities_breathing_step2;
const step3 = messages.activities_breathing_step3;
```

### After:

```typescript
const steps = messages.activities_breathing_step;
const step1 = steps[0];
const step2 = steps[1];
const step3 = steps[2];
```

### Or iterate:

```typescript
messages.activities_breathing_step.map((step, index) => (
  <div key={index}>{step}</div>
))
```

## Step-by-Step Instructions

1. **Analyze (Dry Run)**

   ```bash
   node analyze-numbered-keys.js
   ```

   Review the output to understand what will be changed.

2. **Backup (Optional)**

   ```bash
   cp messages/en.json messages/en.json.manual-backup
   cp messages/he.json messages/he.json.manual-backup
   ```

3. **Convert**

   ```bash
   node convert-numbered-keys-to-arrays.js
   ```

   This creates automatic `.backup` files and performs the conversion.

4. **Review Changes**

   ```bash
   git diff messages/en.json
   git diff messages/he.json
   ```

5. **Update Code**
   Search for references to numbered keys and update them:

   ```bash
   # Find all references
   grep -r "activities_breathing_step[1-3]" src/
   grep -r "instructions[1-4]" src/
   ```

6. **Test**
   - Run the application
   - Test breathing exercise
   - Test all stretching exercises
   - Verify translations appear correctly
   - Test language switching

7. **Commit**

   ```bash
   git add messages/en.json messages/he.json
   git commit -m "refactor(i18n): convert numbered suffix keys to arrays"
   ```

8. **Cleanup**
   ```bash
   # If everything works, remove backup files
   rm messages/en.json.backup
   rm messages/he.json.backup
   ```

## Rollback

If something goes wrong:

```bash
# Restore from automatic backups
cp messages/en.json.backup messages/en.json
cp messages/he.json.backup messages/he.json

# Or from manual backups
cp messages/en.json.manual-backup messages/en.json
cp messages/he.json.manual-backup messages/he.json
```

## Benefits

1. **Cleaner Structure**: Arrays are more semantic for sequential data
2. **Less Verbose**: Reduces key count from 23 to 6 per pattern
3. **Easier Maintenance**: Adding/removing items is simpler
4. **Better Code**: Enables iteration and array methods
5. **Type Safety**: TypeScript can infer array types better

## Potential Issues

1. **Code Updates Required**: All references to numbered keys must be updated
2. **Type Definitions**: TypeScript types may need updating
3. **Paraglide Integration**: Verify that Paraglide handles arrays correctly

## Testing Checklist

- [ ] Breathing exercise displays all 3 steps correctly
- [ ] Each stretching exercise shows 4 instructions
- [ ] Instructions appear in correct order
- [ ] English translations work
- [ ] Hebrew translations work
- [ ] Language switching preserves functionality
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Tests pass

## Related Files

Files that may need updates after conversion:

- `src/activities/BreathingExercise.tsx` - Uses step1, step2, step3
- `src/activities/StretchingRoutine.tsx` - Uses instructions1-4
- Any other files that reference these translation keys

## Notes

- The conversion preserves key order in JSON files
- Arrays maintain the original sequential order (1, 2, 3, 4...)
- Both English and Hebrew files have identical key structures
- This is a breaking change that requires code updates
