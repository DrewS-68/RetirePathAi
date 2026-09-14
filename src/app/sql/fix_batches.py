#!/usr/bin/env python3
"""
Quick fix script for Batches 17-20
Replaces \" with " in JSON fields
"""

import os

def fix_batch(batch_num):
    input_file = f"seed_batch_{batch_num}_50_villages.sql"
    output_file = f"seed_batch_{batch_num}_50_villages_CORRECTED.sql"
    
    if not os.path.exists(input_file):
        print(f"❌ File not found: {input_file}")
        return False
    
    print(f"Fixing Batch {batch_num}...")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace \" with "
    fixed_content = content.replace('\\"', '"')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print(f"✅ Created: {output_file}")
    return True

def main():
    print("Fixing JSON escaping in Batches 17-20...\n")
    
    success_count = 0
    for batch_num in [17, 18, 19, 20]:
        if fix_batch(batch_num):
            success_count += 1
    
    print(f"\n✅ Successfully fixed {success_count}/4 batches!\n")
    print("Import order:")
    print("1. seed_batch_13_50_villages.sql")
    print("2. seed_batch_14_50_villages.sql")
    print("3. seed_batch_15_50_villages_CORRECTED.sql")
    print("4. seed_batch_16_50_villages_CORRECTED.sql")
    print("5. seed_batch_17_50_villages_CORRECTED.sql")
    print("6. seed_batch_18_50_villages_CORRECTED.sql")
    print("7. seed_batch_19_50_villages_CORRECTED.sql")
    print("8. seed_batch_20_50_villages_CORRECTED.sql")
    print("\nFinal count: 905 villages")

if __name__ == "__main__":
    main()
