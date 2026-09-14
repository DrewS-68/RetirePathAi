"""
Image Coverage Statistics
==========================

Quick script to check how many villages have images in your database.
Shows coverage by state, operator, and overall statistics.

USAGE:
    python check_coverage.py
"""

import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

def main():
    print("""
╔════════════════════════════════════════════════════════════════╗
║              Image Coverage Statistics                         ║
╚════════════════════════════════════════════════════════════════╝
    """)
    
    # Check environment variables
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ ERROR: Missing environment variables")
        print("Please configure .env file with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        return
    
    # Connect to Supabase
    try:
        supabase = create_client(supabase_url, supabase_key)
        print("✓ Connected to Supabase\n")
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        return
    
    # Fetch all approved villages
    try:
        response = supabase.table('retirement_villages')\
            .select('id, name, operator, state, suburb, images')\
            .eq('status', 'approved')\
            .execute()
        
        villages = response.data
        total_villages = len(villages)
        
        print(f"Total Approved Villages: {total_villages}\n")
        
        # Calculate overall statistics
        villages_with_images = 0
        total_images = 0
        villages_by_image_count = {
            '0': 0,
            '1-2': 0,
            '3-4': 0,
            '5-6': 0,
            '7+': 0
        }
        
        for village in villages:
            images = village.get('images') or []
            # Filter out empty strings
            valid_images = [img for img in images if img and img.strip()]
            image_count = len(valid_images)
            
            if image_count > 0:
                villages_with_images += 1
                total_images += image_count
            
            # Categorize by image count
            if image_count == 0:
                villages_by_image_count['0'] += 1
            elif image_count <= 2:
                villages_by_image_count['1-2'] += 1
            elif image_count <= 4:
                villages_by_image_count['3-4'] += 1
            elif image_count <= 6:
                villages_by_image_count['5-6'] += 1
            else:
                villages_by_image_count['7+'] += 1
        
        # Print overall statistics
        print("="*70)
        print("OVERALL STATISTICS")
        print("="*70)
        print(f"Villages with images:     {villages_with_images:,} / {total_villages:,} ({villages_with_images/total_villages*100:.1f}%)")
        print(f"Villages without images:  {total_villages - villages_with_images:,} ({(total_villages - villages_with_images)/total_villages*100:.1f}%)")
        print(f"Total images:             {total_images:,}")
        
        if villages_with_images > 0:
            avg_images = total_images / villages_with_images
            print(f"Average images/village:   {avg_images:.1f}")
        
        print("\nImage Count Distribution:")
        for range_label, count in villages_by_image_count.items():
            pct = count / total_villages * 100
            print(f"  {range_label:>5} images: {count:>4} villages ({pct:>5.1f}%)")
        
        # Statistics by state
        print("\n" + "="*70)
        print("COVERAGE BY STATE")
        print("="*70)
        
        states = {}
        for village in villages:
            state = village.get('state', 'Unknown')
            if state not in states:
                states[state] = {'total': 0, 'with_images': 0}
            
            states[state]['total'] += 1
            images = village.get('images') or []
            valid_images = [img for img in images if img and img.strip()]
            if len(valid_images) > 0:
                states[state]['with_images'] += 1
        
        # Sort by total villages (descending)
        sorted_states = sorted(states.items(), key=lambda x: x[1]['total'], reverse=True)
        
        print(f"{'State':<8} {'Total':<8} {'With Images':<14} {'Coverage':<10}")
        print("-" * 70)
        for state, stats in sorted_states:
            total = stats['total']
            with_img = stats['with_images']
            coverage = with_img / total * 100 if total > 0 else 0
            print(f"{state:<8} {total:<8} {with_img:<14} {coverage:>6.1f}%")
        
        # Statistics by operator (top 20)
        print("\n" + "="*70)
        print("COVERAGE BY OPERATOR (Top 20)")
        print("="*70)
        
        operators = {}
        for village in villages:
            operator = village.get('operator', 'Unknown')
            if not operator or operator.strip() == '':
                operator = 'Unknown'
            
            if operator not in operators:
                operators[operator] = {'total': 0, 'with_images': 0}
            
            operators[operator]['total'] += 1
            images = village.get('images') or []
            valid_images = [img for img in images if img and img.strip()]
            if len(valid_images) > 0:
                operators[operator]['with_images'] += 1
        
        # Sort by total villages (descending)
        sorted_operators = sorted(operators.items(), key=lambda x: x[1]['total'], reverse=True)
        
        print(f"{'Operator':<30} {'Total':<8} {'With Images':<14} {'Coverage':<10}")
        print("-" * 70)
        for i, (operator, stats) in enumerate(sorted_operators[:20], 1):
            total = stats['total']
            with_img = stats['with_images']
            coverage = with_img / total * 100 if total > 0 else 0
            # Truncate long operator names
            op_name = operator[:28] + '..' if len(operator) > 30 else operator
            print(f"{op_name:<30} {total:<8} {with_img:<14} {coverage:>6.1f}%")
        
        # Show villages that need images the most
        print("\n" + "="*70)
        print("PRIORITY: Operators Without Images (by village count)")
        print("="*70)
        
        operators_without_images = [
            (op, stats) for op, stats in sorted_operators 
            if stats['with_images'] == 0 and stats['total'] >= 3
        ]
        
        if operators_without_images:
            print(f"{'Operator':<40} {'Villages':<10}")
            print("-" * 70)
            for operator, stats in operators_without_images[:10]:
                op_name = operator[:38] + '..' if len(operator) > 40 else operator
                print(f"{op_name:<40} {stats['total']:<10}")
        else:
            print("✓ All major operators have at least some images!")
        
        # Summary and recommendations
        print("\n" + "="*70)
        print("RECOMMENDATIONS")
        print("="*70)
        
        coverage_pct = villages_with_images / total_villages * 100
        
        if coverage_pct < 10:
            print("🟥 CRITICAL: Very low image coverage")
            print("   → Run: python village_image_scraper.py")
            print("   → Choose Option 5: Top operators first")
        elif coverage_pct < 40:
            print("🟧 LOW: Image coverage needs improvement")
            print("   → Run: python village_image_scraper.py")
            print("   → Choose Option 1: Scrape ALL villages")
        elif coverage_pct < 70:
            print("🟨 MODERATE: Good progress, continue scraping")
            print("   → Target remaining states or operators")
            print("   → Focus on operators with 0% coverage")
        else:
            print("🟩 EXCELLENT: Strong image coverage!")
            print("   → Focus on manual addition for remaining villages")
            print("   → Consider contacting operators for images")
        
        print(f"\nCurrent coverage: {coverage_pct:.1f}%")
        print(f"Villages remaining: {total_villages - villages_with_images:,}")
        
        if villages_with_images > 0:
            avg_images = total_images / villages_with_images
            print(f"Average images per village: {avg_images:.1f}")
        
        print("\n" + "="*70)
        
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        return

if __name__ == "__main__":
    main()
