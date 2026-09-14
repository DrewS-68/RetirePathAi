# MANUAL EDIT REQUIRED

## File to Edit
`/supabase/functions/server/data-enrichment.ts`

## Line Number
After line **393**

## What to Add
Add this EXACT line (with proper indentation - 10 spaces):

```typescript
          await markVillageAsProcessed(village.id, 'skipped', `Parked domain detected (keyword: "${parkedIndicatorFound}")`);
```

## Current Code (lines 391-401)
```typescript
        if (isParked) {
          console.log(`⚠️ Parked domain detected for ${village.name}: ${village.website}`);
          console.log(`  🚨 Trigger keyword: \"${parkedIndicatorFound}\"`);
          results.push({
            villageId: village.id,
            name: village.name,
            status: 'skipped',
            reason: `Parked domain detected (keyword: \"${parkedIndicatorFound}\")`,
            website: village.website
          });
          continue;
        }
```

## Should Become
```typescript
        if (isParked) {
          console.log(`⚠️ Parked domain detected for ${village.name}: ${village.website}`);
          console.log(`  🚨 Trigger keyword: \"${parkedIndicatorFound}\"`);
          await markVillageAsProcessed(village.id, 'skipped', `Parked domain detected (keyword: \"${parkedIndicatorFound}")`);
          results.push({
            villageId: village.id,
            name: village.name,
            status: 'skipped',
            reason: `Parked domain detected (keyword: \"${parkedIndicatorFound}\")`,
            website: village.website
          });
          continue;
        }
```

## Where is "Project Root"?
Your **project root** is wherever you have your RetirePath code on your local computer. For example:
- `C:\Users\YourName\Projects\RetirePath\` (Windows)
- `/Users/YourName/Projects/RetirePath/` (Mac)
- `/home/yourname/projects/retirepath/` (Linux)

This is the folder that contains the `supabase/` folder.

## How to Edit

### Option 1: Use VS Code (Recommended) ✅
1. Open the RetirePath project folder in VS Code
2. Open `/supabase/functions/server/data-enrichment.ts`
3. Press `Ctrl+G` (or `Cmd+G` on Mac) and type `393` to go to line 393
4. At the END of line 393, press Enter to create a new line
5. Paste the code above (with 10 spaces of indentation)
6. Save the file (`Ctrl+S` or `Cmd+S`)

### Option 2: Use Any Text Editor
1. Navigate to your RetirePath folder
2. Open `supabase/functions/server/data-enrichment.ts`
3. Find line 393 (the one with `Trigger keyword`)
4. Add the new line after it
5. Save

## After Editing - Deploy
Run this command from your project root:
```bash
supabase functions deploy make-server-3bba8be8
```

This will upload the fixed version to Supabase.
