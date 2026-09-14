# ============================================================================
# RETIREPATH GOOGLE IMAGES SCRAPER - OPTION 2
# ============================================================================
# This scraper uses Google Images to find photos for villages that failed
# website scraping. Copy this ENTIRE file and paste into Google Colab.
# ============================================================================

import os
import time
import requests
from urllib.parse import urljoin, quote_plus
from bs4 import BeautifulSoup
from supabase import create_client
import re
from io import BytesIO
from PIL import Image
import csv
from typing import List, Dict, Optional

class GoogleImagesVillageScraper:
    """Scraper that uses Google Images to find retirement village photos"""
    
    def __init__(self):
        # Get credentials from environment
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_key:
            raise ValueError("Missing credentials! Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.")
        
        print(f"✓ Connecting to Supabase: {supabase_url}")
        self.supabase = create_client(supabase_url, supabase_key)
        
        # HTTP session with realistic headers
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.google.com/',
            'DNT': '1'
        })
        
        # Image quality criteria
        self.MIN_WIDTH = 800
        self.MIN_HEIGHT = 500
        self.MAX_IMAGES_PER_VILLAGE = 6
        
        # Statistics
        self.stats = {
            'processed': 0,
            'successful': 0,
            'failed': 0,
            'total_images': 0,
            'failed_villages': []  # Track which villages failed for CSV export
        }
    
    def build_google_images_search_url(self, village_name: str, state: str, city: str = None) -> str:
        """
        Build Google Images search URL for a retirement village
        
        Args:
            village_name: Name of the village
            state: Australian state (e.g., 'NSW', 'VIC')
            city: City/suburb if available
        
        Returns:
            Google Images search URL
        """
        # Build search query
        # Example: "Stockland Kirrawee retirement village NSW"
        query_parts = [village_name]
        
        # Add city if available
        if city:
            query_parts.append(city)
        
        # Add "retirement village" to ensure we get the right images
        query_parts.append("retirement village")
        
        # Add state
        query_parts.append(state)
        
        query = " ".join(query_parts)
        encoded_query = quote_plus(query)
        
        # Google Images URL
        # tbs=isz:l means large images only
        # tbm=isch means image search
        url = f"https://www.google.com/search?q={encoded_query}&tbm=isch&tbs=isz:l"
        
        return url
    
    def extract_image_urls_from_google(self, search_url: str, max_images: int = 15) -> List[str]:
        """
        Extract image URLs from Google Images search results
        
        Args:
            search_url: Google Images search URL
            max_images: Maximum number of images to extract
        
        Returns:
            List of image URLs
        """
        try:
            print(f"  Searching Google Images...")
            
            # Add random delay to avoid detection
            time.sleep(1 + (time.time() % 2))  # 1-3 second delay
            
            response = self.session.get(search_url, timeout=15)
            
            if response.status_code != 200:
                print(f"  ✗ Google returned status {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            image_urls = []
            
            # Method 1: Extract from img tags with specific attributes
            for img in soup.find_all('img', limit=50):
                # Google Images often has src or data-src
                src = img.get('src') or img.get('data-src')
                
                if src and src.startswith('http'):
                    # Skip Google's own images (logos, etc)
                    if 'gstatic' not in src and 'google' not in src:
                        image_urls.append(src)
            
            # Method 2: Extract from JavaScript/JSON data
            # Google embeds image URLs in script tags
            scripts = soup.find_all('script')
            for script in scripts:
                if script.string:
                    # Look for URLs in the format: "ou":"https://..."
                    matches = re.findall(r'"ou":"(https?://[^"]+)"', script.string)
                    for match in matches:
                        # Decode unicode escapes
                        url = match.replace('\\u003d', '=').replace('\\u0026', '&')
                        if self.is_valid_image_url(url):
                            image_urls.append(url)
            
            # Remove duplicates while preserving order
            seen = set()
            unique_urls = []
            for url in image_urls:
                if url not in seen:
                    seen.add(url)
                    unique_urls.append(url)
                    if len(unique_urls) >= max_images:
                        break
            
            print(f"  Found {len(unique_urls)} image URLs from Google")
            return unique_urls
            
        except Exception as e:
            print(f"  ✗ Error searching Google: {str(e)[:100]}")
            return []
    
    def is_valid_image_url(self, url: str) -> bool:
        """Check if URL looks like a valid image"""
        try:
            # Must be HTTP/HTTPS
            if not url.startswith('http'):
                return False
            
            url_lower = url.lower()
            
            # Check for image extensions or image indicators
            valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
            has_extension = any(ext in url_lower for ext in valid_extensions)
            
            # Skip common non-photo patterns
            skip_patterns = [
                'logo', 'icon', 'button', 'banner', 'badge', 'avatar',
                'favicon', 'sprite', 'spacer', 'pixel', 'tracking',
                'ad.', 'ads/', 'advertisement', 'promo',
                'facebook.com', 'twitter.com', 'youtube.com',
                'gstatic.com', 'googleapis.com'
            ]
            
            if any(pattern in url_lower for pattern in skip_patterns):
                return False
            
            return has_extension
            
        except:
            return False
    
    def verify_and_download_image(self, url: str) -> Optional[str]:
        """
        Verify image meets quality requirements
        
        Args:
            url: Image URL to verify
        
        Returns:
            Image URL if valid, None otherwise
        """
        try:
            # Download with timeout
            response = self.session.get(url, timeout=10, stream=True)
            
            if response.status_code != 200:
                return None
            
            # Check content type
            content_type = response.headers.get('Content-Type', '')
            if 'image' not in content_type:
                return None
            
            # Load image and check dimensions
            img = Image.open(BytesIO(response.content))
            width, height = img.size
            
            # Must meet minimum size requirements
            if width < self.MIN_WIDTH or height < self.MIN_HEIGHT:
                return None
            
            # Image is valid
            return url
            
        except Exception as e:
            return None
    
    def scrape_village_from_google(self, village: Dict) -> List[str]:
        """
        Scrape images for a village using Google Images
        
        Args:
            village: Village dictionary with name, state, city, etc.
        
        Returns:
            List of verified image URLs
        """
        village_name = village.get('name', '')
        state = village.get('state', '')
        city = village.get('city') or village.get('suburb')
        
        print(f"  Building search query for: {village_name}, {state}")
        
        # Build Google Images search URL
        search_url = self.build_google_images_search_url(village_name, state, city)
        
        # Extract image URLs from Google
        candidate_urls = self.extract_image_urls_from_google(search_url, max_images=20)
        
        if not candidate_urls:
            print(f"  ✗ No images found on Google")
            return []
        
        # Verify each image
        verified_images = []
        print(f"  Verifying {len(candidate_urls)} images...")
        
        for i, url in enumerate(candidate_urls, 1):
            verified_url = self.verify_and_download_image(url)
            
            if verified_url:
                verified_images.append(verified_url)
                print(f"    ✓ Image {i}: Valid ({verified_url[:80]}...)")
                
                # Stop if we have enough images
                if len(verified_images) >= self.MAX_IMAGES_PER_VILLAGE:
                    break
            
            # Small delay between image checks
            time.sleep(0.3)
        
        print(f"  ✓ Found {len(verified_images)} high-quality images")
        return verified_images
    
    def update_village_images(self, village_id: str, images: List[str]) -> bool:
        """Update village in database with image URLs"""
        try:
            self.supabase.table('retirement_villages').update({
                'images': images
            }).eq('id', village_id).execute()
            return True
        except Exception as e:
            print(f"  ✗ Database update failed: {e}")
            return False
    
    def load_villages_from_csv(self, csv_path: str) -> List[Dict]:
        """
        Load villages from CSV file (for failed villages from previous scraping)
        
        Args:
            csv_path: Path to CSV file
        
        Returns:
            List of village dictionaries
        """
        print(f"\n{'='*80}")
        print(f"LOADING VILLAGES FROM CSV: {csv_path}")
        print(f"{'='*80}\n")
        
        villages = []
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    villages.append(row)
            
            print(f"✓ Loaded {len(villages)} villages from CSV")
            return villages
            
        except Exception as e:
            print(f"✗ Error loading CSV: {e}")
            return []
    
    def get_villages_from_database(self, limit: Optional[int] = None, 
                                   state: Optional[str] = None,
                                   operator: Optional[str] = None,
                                   village_ids: Optional[List[str]] = None) -> List[Dict]:
        """
        Fetch villages from database that still need images
        
        Args:
            limit: Maximum number to fetch
            state: Filter by state
            operator: Filter by operator
            village_ids: Specific village IDs to fetch
        
        Returns:
            List of village dictionaries
        """
        print(f"\n{'='*80}")
        print("FETCHING VILLAGES FROM DATABASE")
        print(f"{'='*80}\n")
        
        query = self.supabase.table('retirement_villages').select('*')
        query = query.eq('status', 'approved')
        
        if state:
            query = query.eq('state', state.upper())
            print(f"Filtering by state: {state}")
        
        if operator:
            query = query.ilike('operator', f'%{operator}%')
            print(f"Filtering by operator: {operator}")
        
        if village_ids:
            query = query.in_('id', village_ids)
            print(f"Filtering by {len(village_ids)} specific village IDs")
        
        if limit:
            query = query.limit(limit * 2)  # Fetch extra in case some already have images
        
        response = query.execute()
        
        # Filter out villages that already have images
        villages = []
        for v in response.data:
            images = v.get('images')
            if not images or images == [] or images == [''] or images is None:
                villages.append(v)
        
        if limit and len(villages) > limit:
            villages = villages[:limit]
        
        print(f"✓ Found {len(villages)} villages without images")
        return villages
    
    def scrape_batch(self, villages: List[Dict], delay: float = 3.0):
        """
        Scrape images for a batch of villages
        
        Args:
            villages: List of village dictionaries
            delay: Delay between requests (seconds) - important for Google!
        """
        if not villages:
            print("✓ No villages to process!")
            return
        
        print(f"\n{'='*80}")
        print(f"SCRAPING {len(villages)} VILLAGES USING GOOGLE IMAGES")
        print(f"{'='*80}")
        print(f"Delay between villages: {delay}s")
        print(f"Target images per village: {self.MAX_IMAGES_PER_VILLAGE}")
        print(f"Minimum image size: {self.MIN_WIDTH}x{self.MIN_HEIGHT}")
        print(f"{'='*80}\n")
        
        for i, village in enumerate(villages, 1):
            village_name = village.get('name', 'Unknown')
            village_state = village.get('state', 'N/A')
            village_id = village.get('id')
            
            print(f"\n[{i}/{len(villages)}] {village_name} ({village_state})")
            print("-" * 80)
            
            try:
                # Scrape images from Google
                images = self.scrape_village_from_google(village)
                
                if images:
                    # Update database
                    if self.update_village_images(village_id, images):
                        print(f"  ✓ SUCCESS - Added {len(images)} images to database")
                        self.stats['successful'] += 1
                        self.stats['total_images'] += len(images)
                    else:
                        print(f"  ✗ FAILED - Database update error")
                        self.stats['failed'] += 1
                        self.stats['failed_villages'].append({
                            'id': village_id,
                            'name': village_name,
                            'state': village_state,
                            'reason': 'Database update failed'
                        })
                else:
                    print(f"  ✗ FAILED - No suitable images found on Google")
                    self.stats['failed'] += 1
                    self.stats['failed_villages'].append({
                        'id': village_id,
                        'name': village_name,
                        'state': village_state,
                        'reason': 'No images found on Google'
                    })
                
            except Exception as e:
                print(f"  ✗ ERROR - {str(e)[:100]}")
                self.stats['failed'] += 1
                self.stats['failed_villages'].append({
                    'id': village_id,
                    'name': village_name,
                    'state': village_state,
                    'reason': f'Error: {str(e)[:50]}'
                })
            
            self.stats['processed'] += 1
            
            # Delay between requests (important for Google!)
            if i < len(villages):
                print(f"  Waiting {delay}s before next village...")
                time.sleep(delay)
        
        # Print final summary
        self.print_summary()
    
    def print_summary(self):
        """Print scraping statistics"""
        print(f"\n\n{'='*80}")
        print("SCRAPING COMPLETE - SUMMARY")
        print(f"{'='*80}")
        print(f"Villages processed:  {self.stats['processed']}")
        print(f"Successful updates:  {self.stats['successful']} ({self.stats['successful']/max(self.stats['processed'], 1)*100:.1f}%)")
        print(f"Failed:              {self.stats['failed']}")
        print(f"Total images added:  {self.stats['total_images']}")
        
        if self.stats['successful'] > 0:
            avg_images = self.stats['total_images'] / self.stats['successful']
            print(f"Avg images/village:  {avg_images:.1f}")
        
        print(f"{'='*80}\n")
        
        # Show sample of failed villages
        if self.stats['failed_villages']:
            print(f"\nFailed Villages (first 10):")
            print("-" * 80)
            for village in self.stats['failed_villages'][:10]:
                print(f"  • {village['name']} ({village['state']}) - {village['reason']}")
            
            if len(self.stats['failed_villages']) > 10:
                print(f"  ... and {len(self.stats['failed_villages']) - 10} more")
    
    def export_failed_villages_csv(self, output_path: str = 'failed_villages_google_scrape.csv'):
        """Export failed villages to CSV for retry"""
        if not self.stats['failed_villages']:
            print("\n✓ No failed villages to export!")
            return
        
        try:
            with open(output_path, 'w', newline='', encoding='utf-8') as f:
                fieldnames = ['id', 'name', 'state', 'reason']
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(self.stats['failed_villages'])
            
            print(f"\n✓ Exported {len(self.stats['failed_villages'])} failed villages to: {output_path}")
            
        except Exception as e:
            print(f"\n✗ Error exporting CSV: {e}")


# ============================================================================
# HOW TO USE IN GOOGLE COLAB
# ============================================================================
"""
STEP 1: Install dependencies
-----------------------------
!pip install requests beautifulsoup4 pillow supabase lxml

STEP 2: Set credentials
------------------------
import os
os.environ['SUPABASE_URL'] = 'https://YOUR-PROJECT-ID.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

REPLACE WITH YOUR ACTUAL CREDENTIALS!

STEP 3: Upload your CSV file (if you have one)
-----------------------------------------------
Click the folder icon on the left sidebar in Colab, then upload
'failed_villages_20251211_102517.csv'

STEP 4: Run this entire file
-----------------------------
This creates the GoogleImagesVillageScraper class

STEP 5: Choose your scraping strategy
--------------------------------------

# OPTION A: Process villages from CSV file
scraper = GoogleImagesVillageScraper()
villages = scraper.load_villages_from_csv('failed_villages_20251211_102517.csv')

# Convert CSV rows to proper format with database lookup
village_ids = [v['id'] for v in villages if 'id' in v]
db_villages = scraper.get_villages_from_database(village_ids=village_ids)

# Scrape first batch (50 villages) - Google rate limiting!
scraper.scrape_batch(db_villages[:50], delay=3.0)

# OPTION B: Scrape from database (villages without images)
scraper = GoogleImagesVillageScraper()
villages = scraper.get_villages_from_database(limit=50)
scraper.scrape_batch(villages, delay=3.0)

# OPTION C: Scrape specific state
scraper = GoogleImagesVillageScraper()
villages = scraper.get_villages_from_database(state='NSW', limit=100)
scraper.scrape_batch(villages, delay=3.0)

# OPTION D: Scrape specific operator
scraper = GoogleImagesVillageScraper()
villages = scraper.get_villages_from_database(operator='Stockland')
scraper.scrape_batch(villages, delay=3.0)

# OPTION E: Process CSV in batches (RECOMMENDED for 763 villages)
# This processes your failed villages in manageable chunks
scraper = GoogleImagesVillageScraper()

# Load all villages from CSV
csv_villages = scraper.load_villages_from_csv('failed_villages_20251211_102517.csv')
print(f"Total villages in CSV: {len(csv_villages)}")

# Get IDs and fetch from database
village_ids = [v['id'] for v in csv_villages if 'id' in v]
all_db_villages = scraper.get_villages_from_database(village_ids=village_ids)

# Process in batches of 50 (to manage Google rate limiting)
batch_size = 50
total_batches = (len(all_db_villages) + batch_size - 1) // batch_size

for batch_num in range(total_batches):
    start_idx = batch_num * batch_size
    end_idx = min(start_idx + batch_size, len(all_db_villages))
    batch_villages = all_db_villages[start_idx:end_idx]
    
    print(f"\n\n{'#'*80}")
    print(f"# BATCH {batch_num + 1}/{total_batches}")
    print(f"# Villages {start_idx + 1} to {end_idx}")
    print(f"{'#'*80}\n")
    
    batch_scraper = GoogleImagesVillageScraper()
    batch_scraper.scrape_batch(batch_villages, delay=3.0)
    
    # Longer pause between batches
    if batch_num < total_batches - 1:
        print(f"\n⏸  Pausing 30 seconds before next batch...")
        time.sleep(30)

# Export any villages that still failed
scraper.export_failed_villages_csv('failed_after_google_scrape.csv')

STEP 6: Check coverage
----------------------
from supabase import create_client
import os

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Get all approved villages
all_villages = supabase.table('retirement_villages').select('id, name, images, state').eq('status', 'approved').execute()

total = len(all_villages.data)
with_images = len([v for v in all_villages.data if v.get('images') and len(v.get('images', [])) > 0])

print(f"\n{'='*60}")
print("IMAGE COVERAGE STATISTICS")
print(f"{'='*60}")
print(f"Total approved villages: {total}")
print(f"Villages with images:    {with_images}")
print(f"Coverage:                {with_images/total*100:.1f}%")
print(f"Still need images:       {total - with_images}")
print(f"{'='*60}\n")

IMPORTANT NOTES:
---------------
1. Google rate limiting: Use delay=3.0 or higher
2. Process in batches of 50 villages max per session
3. If Google starts blocking, increase delay to 5.0 seconds
4. The scraper will save failed villages to CSV for retry
5. Some villages may genuinely have no online images
6. Expected success rate: 50-70% (Google Images coverage varies)
"""
