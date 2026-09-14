"""
Quick Test Script for Image Scraper
====================================

This is a simplified version for quick testing.
It scrapes just 5 villages to verify everything is working.

USAGE:
    python quick_test.py
"""

import os
from dotenv import load_dotenv
from village_image_scraper import VillageImageScraper

# Load environment variables
load_dotenv()

def main():
    print("""
╔════════════════════════════════════════════════════════════════╗
║              Image Scraper - Quick Test Mode                   ║
║                                                                ║
║  This will scrape images for just 5 villages to test.        ║
╚════════════════════════════════════════════════════════════════╝
    """)
    
    # Check if .env is configured
    if not os.getenv('SUPABASE_URL') or not os.getenv('SUPABASE_SERVICE_ROLE_KEY'):
        print("❌ ERROR: Environment variables not configured!")
        print("\nPlease create a .env file in the /scrapers directory with:")
        print("  SUPABASE_URL=https://your-project.supabase.co")
        print("  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key")
        print("\nSee .env.example for a template.")
        return
    
    print("✓ Environment variables found")
    print("\nInitializing scraper...")
    
    try:
        scraper = VillageImageScraper()
        
        print("\n" + "="*60)
        print("QUICK TEST: Scraping 5 villages")
        print("="*60)
        
        # Scrape just 5 villages with 2-second delay
        scraper.run(limit=5, delay=2.0)
        
        print("\n" + "="*60)
        print("✓ TEST COMPLETE!")
        print("="*60)
        print("\nNext steps:")
        print("1. Check image_scraper.log for details")
        print("2. Go to your Supabase dashboard to verify images were added")
        print("3. Check your Village Directory to see images displayed")
        print("\nIf everything looks good, run:")
        print("  python village_image_scraper.py")
        print("to scrape more villages.")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("\nTroubleshooting:")
        print("1. Verify your .env file is configured correctly")
        print("2. Check that you have internet connection")
        print("3. Ensure all dependencies are installed: pip install -r requirements.txt")
        print("4. See IMAGE_SCRAPER_GUIDE.md for detailed help")

if __name__ == "__main__":
    main()
