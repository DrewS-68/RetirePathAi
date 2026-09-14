# ============================================================================
# RETIREPATH IMAGE SCRAPER - GOOGLE COLAB VERSION
# ============================================================================
# Copy this ENTIRE file and paste into Google Colab
# Then follow the instructions at the bottom
# ============================================================================

import os
import time
import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from supabase import create_client
import re
from io import BytesIO
from PIL import Image
import logging

class VillageImageScraperColab:
    """Simplified scraper for Google Colab"""
    
    def __init__(self):
        # Get credentials from environment
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_key:
            raise ValueError("Missing credentials! Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.")
        
        print(f"✓ Connecting to Supabase: {supabase_url}")
        self.supabase = create_client(supabase_url, supabase_key)
        
        # HTTP session
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        
        self.stats = {
            'processed': 0,
            'successful': 0,
            'failed': 0,
            'total_images': 0
        }
    
    def get_villages_without_images(self, limit=None, operator=None, state=None):
        """Fetch villages that need images"""
        print(f"\n{'='*80}")
        print("FETCHING VILLAGES FROM DATABASE")
        print(f"{'='*80}")
        
        query = self.supabase.table('retirement_villages').select('*')
        query = query.eq('status', 'approved')
        query = query.not_.is_('website', 'null')
        
        if operator:
            query = query.ilike('operator', f'%{operator}%')
            print(f"Filtering by operator: {operator}")
        
        if state:
            query = query.eq('state', state.upper())
            print(f"Filtering by state: {state}")
        
        if limit:
            query = query.limit(limit * 3)  # Fetch extra in case some already have images
        
        response = query.execute()
        
        # Filter out villages that already have images
        villages = [v for v in response.data if not v.get('images') or v.get('images') == [] or v.get('images') == [''] or v.get('images') is None]
        
        if limit and len(villages) > limit:
            villages = villages[:limit]
        
        print(f"✓ Found {len(villages)} villages without images")
        return villages
    
    def is_valid_image_url(self, url):
        """Check if URL looks like an image"""
        try:
            parsed = urlparse(url)
            path = parsed.path.lower()
            
            # Must end with image extension
            if not any(path.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                return False
            
            # Skip common non-photo images
            skip_keywords = ['logo', 'icon', 'button', 'banner', 'badge', 'avatar', 
                           'thumbnail', 'thumb', 'sprite', 'bg', 'background']
            if any(keyword in path.lower() for keyword in skip_keywords):
                return False
            
            return True
        except:
            return False
    
    def verify_image(self, url):
        """Verify image is valid and high quality"""
        try:
            response = self.session.get(url, timeout=10, stream=True)
            
            if response.status_code != 200:
                return False
            
            # Check image size
            img = Image.open(BytesIO(response.content))
            width, height = img.size
            
            # Must be at least 800x500
            if width < 800 or height < 500:
                return False
            
            return True
        except:
            return False
    
    def extract_images_from_url(self, url):
        """Extract images from a village website"""
        try:
            print(f"  Visiting: {url}")
            response = self.session.get(url, timeout=15)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            image_urls = set()
            
            # Find all img tags
            for img in soup.find_all('img', limit=50):
                src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                
                if src:
                    full_url = urljoin(url, src)
                    
                    if self.is_valid_image_url(full_url):
                        image_urls.add(full_url)
            
            print(f"  Found {len(image_urls)} potential images")
            
            # Verify images
            verified = []
            for img_url in list(image_urls)[:15]:  # Check up to 15
                if self.verify_image(img_url):
                    verified.append(img_url)
                    if len(verified) >= 8:  # Max 8 per village
                        break
            
            print(f"  ✓ Verified {len(verified)} high-quality images")
            return verified
            
        except Exception as e:
            print(f"  ✗ Error: {str(e)[:100]}")
            return []
    
    def update_village_images(self, village_id, images):
        """Update village with image URLs"""
        try:
            self.supabase.table('retirement_villages').update({
                'images': images
            }).eq('id', village_id).execute()
            return True
        except Exception as e:
            print(f"  ✗ Database update failed: {e}")
            return False
    
    def scrape(self, limit=None, operator=None, state=None, delay=2.0):
        """Main scraping function"""
        print(f"\n{'='*80}")
        print("RETIREPATH IMAGE SCRAPER - STARTING")
        print(f"{'='*80}\n")
        
        villages = self.get_villages_without_images(limit, operator, state)
        
        if not villages:
            print("✓ No villages need images!")
            return
        
        print(f"\n{'='*80}")
        print(f"SCRAPING {len(villages)} VILLAGES")
        print(f"{'='*80}\n")
        
        for i, village in enumerate(villages, 1):
            print(f"[{i}/{len(villages)}] {village['name']} ({village.get('state', 'N/A')})")
            
            if not village.get('website'):
                print("  ✗ No website")
                self.stats['failed'] += 1
                continue
            
            # Extract images
            images = self.extract_images_from_url(village['website'])
            
            if images:
                # Update database
                if self.update_village_images(village['id'], images):
                    print(f"  ✓ SUCCESS - Added {len(images)} images")
                    self.stats['successful'] += 1
                    self.stats['total_images'] += len(images)
                else:
                    print(f"  ✗ Failed to update database")
                    self.stats['failed'] += 1
            else:
                print(f"  ✗ No suitable images found")
                self.stats['failed'] += 1
            
            self.stats['processed'] += 1
            
            # Delay between requests
            if i < len(villages):
                print(f"  Waiting {delay}s...\n")
                time.sleep(delay)
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print final statistics"""
        print(f"\n{'='*80}")
        print("SCRAPING COMPLETE - SUMMARY")
        print(f"{'='*80}")
        print(f"Villages processed:  {self.stats['processed']}")
        print(f"Successful updates:  {self.stats['successful']} ({self.stats['successful']/self.stats['processed']*100:.1f}%)")
        print(f"Failed:              {self.stats['failed']}")
        print(f"Total images added:  {self.stats['total_images']}")
        if self.stats['successful'] > 0:
            print(f"Avg images/village:  {self.stats['total_images']/self.stats['successful']:.1f}")
        print(f"{'='*80}\n")


# ============================================================================
# HOW TO USE IN GOOGLE COLAB
# ============================================================================
"""
STEP 1: Install dependencies (run this cell first)
------------------------------------------------
!pip install requests beautifulsoup4 pillow supabase lxml


STEP 2: Set your credentials (run this cell second)
-------------------------------------------------
import os
os.environ['SUPABASE_URL'] = 'https://YOUR-PROJECT-ID.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

REPLACE THE VALUES ABOVE WITH YOUR ACTUAL CREDENTIALS!
Get them from: Supabase Dashboard → Settings → API


STEP 3: Run this entire file (creates the scraper class)
------------------------------------------------------
Just run this cell - it defines the scraper


STEP 4: Create scraper and run (choose ONE option below)
--------------------------------------------------------

# Option A: Test with 5 villages
scraper = VillageImageScraperColab()
scraper.scrape(limit=5, delay=2.0)

# Option B: Scrape specific operator
scraper = VillageImageScraperColab()
scraper.scrape(operator='Stockland', delay=2.0)

# Option C: Scrape specific state
scraper = VillageImageScraperColab()
scraper.scrape(state='NSW', limit=50, delay=2.0)

# Option D: Scrape top operators (one at a time)
TOP_OPERATORS = ['Stockland', 'Aveo', 'Lendlease', 'Ingenia', 'Keyton', 
                 'Living Choice', 'Uniting', 'Anglicare', 'The Whiddon Group']

for operator in TOP_OPERATORS:
    print(f"\n\n{'#'*80}")
    print(f"# SCRAPING: {operator}")
    print(f"{'#'*80}\n")
    scraper = VillageImageScraperColab()
    scraper.scrape(operator=operator, delay=2.0)
    print(f"\nCompleted {operator}. Moving to next...\n")


STEP 5: Check coverage
----------------------
Run this to see how many villages now have images:

from supabase import create_client
import os

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Count total approved villages
total = supabase.table('retirement_villages').select('id', count='exact').eq('status', 'approved').execute()
total_count = total.count

# Count villages with images
with_images = supabase.table('retirement_villages').select('id', count='exact').eq('status', 'approved').not_.is_('images', 'null').execute()
with_images_count = len([v for v in with_images.data if v.get('images') and v.get('images') != []])

print(f"\n{'='*60}")
print(f"COVERAGE STATISTICS")
print(f"{'='*60}")
print(f"Total villages:        {total_count}")
print(f"Villages with images:  {with_images_count}")
print(f"Coverage:              {with_images_count/total_count*100:.1f}%")
print(f"Still need images:     {total_count - with_images_count}")
print(f"{'='*60}\n")

"""
