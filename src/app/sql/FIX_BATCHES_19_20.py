#!/usr/bin/env python3
"""
INSTANT FIX for Batches 19 & 20
Simply run: python3 FIX_BATCHES_19_20.py
"""

import os
import sys

def fix_batch(batch_num):
    """Fix JSON escaping in a batch file"""
    input_file = f"seed_batch_{batch_num}_50_villages.sql"
    output_file = f"seed_batch_{batch_num}_50_villages_CORRECTED.sql"
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"❌ ERROR: {input_file} not found!")
        print(f"   Make sure you're in the /sql directory")
        return False
    
    print(f"🔧 Fixing Batch {batch_num}...")
    
    try:
        # Read the file
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix the JSON escaping: Replace \" with "
        fixed_content = content.replace('\\"', '"')
        
        # Write the corrected file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        
        print(f"✅ Created: {output_file}")
        return True
        
    except Exception as e:
        print(f"❌ ERROR fixing Batch {batch_num}: {e}")
        return False

def main():
    print("=" * 60)
    print("  BATCH 19 & 20 JSON FIX SCRIPT")
    print("  Fixes: \\\" → \"")
    print("=" * 60)
    print()
    
    # Check if we're in the right directory
    if not os.path.exists("seed_batch_19_50_villages.sql"):
        print("⚠️  WARNING: Can't find batch files in current directory!")
        print()
        print("Please run this script from the /sql directory:")
        print("  cd sql")
        print("  python3 FIX_BATCHES_19_20.py")
        print()
        sys.exit(1)
    
    # Fix batches 19 and 20
    success_count = 0
    
    if fix_batch(19):
        success_count += 1
    
    print()
    
    if fix_batch(20):
        success_count += 1
    
    print()
    print("=" * 60)
    
    if success_count == 2:
        print("🎉 SUCCESS! Both batches fixed!")
        print()
        print("✅ You now have:")
        print("   • seed_batch_19_50_villages_CORRECTED.sql")
        print("   • seed_batch_20_50_villages_CORRECTED.sql")
        print()
        print("📊 Ready to import! Your complete lineup:")
        print("   1. seed_batch_13_50_villages.sql → 555 total")
        print("   2. seed_batch_14_50_villages.sql → 605 total")
        print("   3. seed_batch_15_50_villages_CORRECTED.sql → 655 total")
        print("   4. seed_batch_16_50_villages_CORRECTED.sql → 705 total")
        print("   5. seed_batch_17_50_villages_CORRECTED.sql → 755 total")
        print("   6. seed_batch_18_50_villages_CORRECTED.sql → 805 total")
        print("   7. seed_batch_19_50_villages_CORRECTED.sql → 855 total")
        print("   8. seed_batch_20_50_villages_CORRECTED.sql → 905 total ✨")
        print()
        print("🚀 Import via Supabase SQL Editor and reach 905 villages!")
    else:
        print(f"⚠️  Only {success_count}/2 batches fixed successfully")
        print("   Check the error messages above")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
