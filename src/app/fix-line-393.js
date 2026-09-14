// This script patches line 393 in data-enrichment.ts
// RUN THIS IN NODE.JS to fix the file

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'supabase', 'functions', 'server', 'data-enrichment.ts');
const fileContent = fs.readFileSync(filePath, 'utf8');
const lines = fileContent.split('\n');

// Find line 393 (array index 392) and insert after it
const lineToInsert = '          await markVillageAsProcessed(village.id, \'skipped\', `Parked domain detected (keyword: "${parkedIndicatorFound}")`);';

// Insert after line 393
lines.splice(393, 0, lineToInsert);

// Write back
fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('✅ Fixed! Line added after line 393.');
