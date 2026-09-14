// Run this in the browser console on Figma Make to fix the file
// INSTRUCTIONS:
// 1. Open browser DevTools (F12)
// 2. Go to Console tab
// 3. Copy and paste this ENTIRE script
// 4. Press Enter

const fixFile = `await markVillageAsProcessed(village.id, 'skipped', \`Parked domain detected (keyword: "\${parkedIndicatorFound}")\`);`;

console.log('🔧 Fixing data-enrichment.ts...');
console.log('📋 Line to add after line 393:');
console.log(fixFile);
console.log('');
console.log('⚠️ MANUAL STEPS REQUIRED:');
console.log('1. In Figma Make, navigate to /supabase/functions/server/data-enrichment.ts');
console.log('2. Find line 393 (contains: Trigger keyword)');
console.log('3. Add a new line after it');
console.log('4. Paste this line with 10 spaces of indentation:');
console.log('          ' + fixFile);
