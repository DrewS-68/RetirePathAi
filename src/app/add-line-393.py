#!/usr/bin/env python3
"""
Quick script to add the missing line to data-enrichment.ts
Run this from your project root: python3 add-line-393.py
"""

file_path = 'supabase/functions/server/data-enrichment.ts'

# Read the file
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The line we want to add
new_line = '          await markVillageAsProcessed(village.id, \'skipped\', `Parked domain detected (keyword: "${parkedIndicatorFound}")`  );\n'

# Insert after line 393 (index 392 since 0-indexed)
# Line 393 contains: console.log(`  🚨 Trigger keyword: "${parkedIndicatorFound}"`);
# We want to insert AFTER it
lines.insert(393, new_line)

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('✅ SUCCESS! Added line after line 393')
print('📁 File:', file_path)
print('➕ Added:', new_line.strip())
