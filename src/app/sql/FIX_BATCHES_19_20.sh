#!/bin/bash
# INSTANT FIX for Batches 19 & 20
# Simply run: bash FIX_BATCHES_19_20.sh

echo "============================================================"
echo "  BATCH 19 & 20 JSON FIX SCRIPT"
echo "  Fixes: \\\" → \""
echo "============================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "seed_batch_19_50_villages.sql" ]; then
    echo "⚠️  WARNING: Can't find batch files in current directory!"
    echo ""
    echo "Please run this script from the /sql directory:"
    echo "  cd sql"
    echo "  bash FIX_BATCHES_19_20.sh"
    echo ""
    exit 1
fi

# Function to fix a batch
fix_batch() {
    local batch_num=$1
    local input_file="seed_batch_${batch_num}_50_villages.sql"
    local output_file="seed_batch_${batch_num}_50_villages_CORRECTED.sql"
    
    if [ ! -f "$input_file" ]; then
        echo "❌ ERROR: $input_file not found!"
        return 1
    fi
    
    echo "🔧 Fixing Batch $batch_num..."
    
    # Use sed to replace \" with "
    sed 's/\\"/"/g' "$input_file" > "$output_file"
    
    if [ $? -eq 0 ]; then
        echo "✅ Created: $output_file"
        return 0
    else
        echo "❌ ERROR fixing Batch $batch_num"
        return 1
    fi
}

# Fix batches 19 and 20
success_count=0

fix_batch 19
if [ $? -eq 0 ]; then
    ((success_count++))
fi

echo ""

fix_batch 20
if [ $? -eq 0 ]; then
    ((success_count++))
fi

echo ""
echo "============================================================"

if [ $success_count -eq 2 ]; then
    echo "🎉 SUCCESS! Both batches fixed!"
    echo ""
    echo "✅ You now have:"
    echo "   • seed_batch_19_50_villages_CORRECTED.sql"
    echo "   • seed_batch_20_50_villages_CORRECTED.sql"
    echo ""
    echo "📊 Ready to import! Your complete lineup:"
    echo "   1. seed_batch_13_50_villages.sql → 555 total"
    echo "   2. seed_batch_14_50_villages.sql → 605 total"
    echo "   3. seed_batch_15_50_villages_CORRECTED.sql → 655 total"
    echo "   4. seed_batch_16_50_villages_CORRECTED.sql → 705 total"
    echo "   5. seed_batch_17_50_villages_CORRECTED.sql → 755 total"
    echo "   6. seed_batch_18_50_villages_CORRECTED.sql → 805 total"
    echo "   7. seed_batch_19_50_villages_CORRECTED.sql → 855 total"
    echo "   8. seed_batch_20_50_villages_CORRECTED.sql → 905 total ✨"
    echo ""
    echo "🚀 Import via Supabase SQL Editor and reach 905 villages!"
else
    echo "⚠️  Only $success_count/2 batches fixed successfully"
    echo "   Check the error messages above"
fi

echo "============================================================"
