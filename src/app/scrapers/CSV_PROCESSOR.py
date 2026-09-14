"""
CSV Processor for Failed Villages
==================================

This script helps you work with the CSV file of failed villages from
the website scraping. Use it to analyze, filter, and prepare batches.

USAGE IN GOOGLE COLAB:
1. Upload your CSV: failed_villages_20251211_102517.csv
2. Run this entire file
3. Use the helper functions below
"""

import csv
from typing import List, Dict
from collections import Counter

class FailedVillageCSVProcessor:
    """Process and analyze failed villages CSV"""
    
    def __init__(self, csv_path: str):
        self.csv_path = csv_path
        self.villages = self.load_csv()
    
    def load_csv(self) -> List[Dict]:
        """Load CSV file"""
        villages = []
        try:
            with open(self.csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    villages.append(row)
            print(f"✓ Loaded {len(villages)} villages from CSV")
            return villages
        except Exception as e:
            print(f"✗ Error loading CSV: {e}")
            return []
    
    def analyze(self):
        """Analyze the CSV and print statistics"""
        if not self.villages:
            print("No villages to analyze")
            return
        
        print(f"\n{'='*80}")
        print("FAILED VILLAGES CSV ANALYSIS")
        print(f"{'='*80}\n")
        
        total = len(self.villages)
        print(f"Total failed villages: {total}\n")
        
        # Breakdown by state
        print("Breakdown by State:")
        print("-" * 40)
        states = Counter(v.get('state', 'Unknown') for v in self.villages)
        for state, count in sorted(states.items(), key=lambda x: x[1], reverse=True):
            pct = count / total * 100
            print(f"  {state:4s}: {count:4d} villages ({pct:5.1f}%)")
        
        # Breakdown by operator (top 10)
        print("\nTop 10 Operators:")
        print("-" * 40)
        operators = Counter(v.get('operator', 'Unknown') for v in self.villages)
        for operator, count in operators.most_common(10):
            pct = count / total * 100
            print(f"  {operator[:30]:30s}: {count:3d} villages ({pct:4.1f}%)")
        
        # Failure reasons if available
        if 'reason' in self.villages[0]:
            print("\nFailure Reasons:")
            print("-" * 40)
            reasons = Counter(v.get('reason', 'Unknown') for v in self.villages)
            for reason, count in sorted(reasons.items(), key=lambda x: x[1], reverse=True):
                pct = count / total * 100
                print(f"  {reason[:50]:50s}: {count:3d} ({pct:4.1f}%)")
        
        print(f"\n{'='*80}\n")
    
    def filter_by_state(self, state: str) -> List[Dict]:
        """Get villages from a specific state"""
        filtered = [v for v in self.villages if v.get('state', '').upper() == state.upper()]
        print(f"✓ Found {len(filtered)} villages in {state}")
        return filtered
    
    def filter_by_operator(self, operator: str) -> List[Dict]:
        """Get villages from a specific operator"""
        filtered = [v for v in self.villages if operator.lower() in v.get('operator', '').lower()]
        print(f"✓ Found {len(filtered)} villages for operator '{operator}'")
        return filtered
    
    def get_batch(self, start: int, size: int) -> List[Dict]:
        """Get a batch of villages"""
        end = min(start + size, len(self.villages))
        batch = self.villages[start:end]
        print(f"✓ Batch: villages {start+1} to {end} ({len(batch)} villages)")
        return batch
    
    def get_village_ids(self) -> List[str]:
        """Extract all village IDs"""
        ids = [v.get('id') for v in self.villages if v.get('id')]
        print(f"✓ Extracted {len(ids)} village IDs")
        return ids
    
    def get_villages_by_priority(self) -> Dict[str, List[Dict]]:
        """
        Organize villages by priority:
        - High priority: Large operators, metro areas
        - Medium priority: Regional areas, medium operators
        - Low priority: Small operators, remote areas
        """
        high_priority_operators = [
            'Stockland', 'Aveo', 'Lendlease', 'Ingenia', 'Keyton',
            'Living Choice', 'Retire Australia', 'Lifestyle Communities',
            'Gateway Lifestyle', 'Hometown Australia'
        ]
        
        metro_states = ['NSW', 'VIC', 'QLD']
        
        high = []
        medium = []
        low = []
        
        for v in self.villages:
            operator = v.get('operator', '')
            state = v.get('state', '')
            
            # High priority: big operators
            if any(op in operator for op in high_priority_operators):
                high.append(v)
            # Medium priority: metro states
            elif state in metro_states:
                medium.append(v)
            # Low priority: everything else
            else:
                low.append(v)
        
        print(f"\n{'='*60}")
        print("PRIORITY BREAKDOWN")
        print(f"{'='*60}")
        print(f"High priority:   {len(high):3d} villages (large operators)")
        print(f"Medium priority: {len(medium):3d} villages (metro areas)")
        print(f"Low priority:    {len(low):3d} villages (regional/small operators)")
        print(f"{'='*60}\n")
        
        return {
            'high': high,
            'medium': medium,
            'low': low
        }
    
    def export_subset(self, villages: List[Dict], output_path: str):
        """Export a subset of villages to new CSV"""
        if not villages:
            print("No villages to export")
            return
        
        try:
            fieldnames = villages[0].keys()
            with open(output_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(villages)
            
            print(f"✓ Exported {len(villages)} villages to: {output_path}")
            
        except Exception as e:
            print(f"✗ Error exporting: {e}")


# ============================================================================
# USAGE EXAMPLES IN GOOGLE COLAB
# ============================================================================
"""

# STEP 1: Load and analyze your CSV
# ----------------------------------
processor = FailedVillageCSVProcessor('failed_villages_20251211_102517.csv')
processor.analyze()


# STEP 2: Get village IDs for database lookup
# --------------------------------------------
village_ids = processor.get_village_ids()

# Use with main scraper:
from google_images_scraper import GoogleImagesVillageScraper
scraper = GoogleImagesVillageScraper()
db_villages = scraper.get_villages_from_database(village_ids=village_ids)


# STEP 3: Process by priority (recommended)
# ------------------------------------------
priorities = processor.get_villages_by_priority()

# Process high priority first
print("Processing HIGH priority villages...")
high_ids = [v['id'] for v in priorities['high'] if v.get('id')]
high_db_villages = scraper.get_villages_from_database(village_ids=high_ids)
scraper.scrape_batch(high_db_villages[:50], delay=3.0)


# STEP 4: Process by state
# -------------------------
nsw_villages = processor.filter_by_state('NSW')
nsw_ids = [v['id'] for v in nsw_villages if v.get('id')]
nsw_db_villages = scraper.get_villages_from_database(village_ids=nsw_ids)
scraper.scrape_batch(nsw_db_villages, delay=3.0)


# STEP 5: Process by operator
# ----------------------------
stockland_villages = processor.filter_by_operator('Stockland')
stockland_ids = [v['id'] for v in stockland_villages if v.get('id')]
stockland_db = scraper.get_villages_from_database(village_ids=stockland_ids)
scraper.scrape_batch(stockland_db, delay=3.0)


# STEP 6: Process in batches
# ---------------------------
batch_size = 50
total_batches = (len(processor.villages) + batch_size - 1) // batch_size

for i in range(total_batches):
    batch = processor.get_batch(i * batch_size, batch_size)
    batch_ids = [v['id'] for v in batch if v.get('id')]
    db_batch = scraper.get_villages_from_database(village_ids=batch_ids)
    
    print(f"\nProcessing batch {i+1}/{total_batches}...")
    batch_scraper = GoogleImagesVillageScraper()
    batch_scraper.scrape_batch(db_batch, delay=3.0)
    
    if i < total_batches - 1:
        print("Pausing 30 seconds...")
        import time
        time.sleep(30)


# STEP 7: Export filtered subset
# -------------------------------
# Export just NSW villages to a new CSV
nsw = processor.filter_by_state('NSW')
processor.export_subset(nsw, 'nsw_failed_villages.csv')

# Export high priority to new CSV
priorities = processor.get_villages_by_priority()
processor.export_subset(priorities['high'], 'high_priority_villages.csv')


# STEP 8: Sample villages for manual testing
# -------------------------------------------
# Get first 10 villages for testing
sample = processor.villages[:10]
sample_ids = [v['id'] for v in sample if v.get('id')]
sample_db = scraper.get_villages_from_database(village_ids=sample_ids)
scraper.scrape_batch(sample_db, delay=3.0)

"""
