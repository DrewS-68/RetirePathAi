#!/bin/bash
# Quick fix script for Batches 17-20
# Replaces \" with " in JSON fields

echo "Fixing JSON escaping in Batches 17-20..."

# Navigate to SQL directory
cd "$(dirname "$0")"

# Batch 17
if [ -f "seed_batch_17_50_villages.sql" ]; then
    echo "Fixing Batch 17..."
    sed 's/\\"/"/g' seed_batch_17_50_villages.sql > seed_batch_17_50_villages_CORRECTED.sql
    echo "✅ Created: seed_batch_17_50_villages_CORRECTED.sql"
fi

# Batch 18
if [ -f "seed_batch_18_50_villages.sql" ]; then
    echo "Fixing Batch 18..."
    sed 's/\\"/"/g' seed_batch_18_50_villages.sql > seed_batch_18_50_villages_CORRECTED.sql
    echo "✅ Created: seed_batch_18_50_villages_CORRECTED.sql"
fi

# Batch 19
if [ -f "seed_batch_19_50_villages.sql" ]; then
    echo "Fixing Batch 19..."
    sed 's/\\"/"/g' seed_batch_19_50_villages.sql > seed_batch_19_50_villages_CORRECTED.sql
    echo "✅ Created: seed_batch_19_50_villages_CORRECTED.sql"
fi

# Batch 20
if [ -f "seed_batch_20_50_villages.sql" ]; then
    echo "Fixing Batch 20..."
    sed 's/\\"/"/g' seed_batch_20_50_villages.sql > seed_batch_20_50_villages_CORRECTED.sql
    echo "✅ Created: seed_batch_20_50_villages_CORRECTED.sql"
fi

echo ""
echo "✅ All batches corrected!"
echo ""
echo "Import order:"
echo "1. seed_batch_13_50_villages.sql"
echo "2. seed_batch_14_50_villages.sql"
echo "3. seed_batch_15_50_villages_CORRECTED.sql"
echo "4. seed_batch_16_50_villages_CORRECTED.sql"
echo "5. seed_batch_17_50_villages_CORRECTED.sql"
echo "6. seed_batch_18_50_villages_CORRECTED.sql"
echo "7. seed_batch_19_50_villages_CORRECTED.sql"
echo "8. seed_batch_20_50_villages_CORRECTED.sql"
echo ""
echo "Final count: 905 villages"
