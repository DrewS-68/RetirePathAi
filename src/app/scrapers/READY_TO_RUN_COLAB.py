# ═══════════════════════════════════════════════════════════════════════════
# GOOGLE COLAB SETUP - COPY ALL 5 CELLS BELOW
# ═══════════════════════════════════════════════════════════════════════════

# ───────────────────────────────────────────────────────────────────────────
# CELL 1: Install Libraries
# ───────────────────────────────────────────────────────────────────────────
# Copy everything between the arrows and paste into Cell 1 in Google Colab

!pip install -q requests beautifulsoup4 pillow supabase lxml

# ───────────────────────────────────────────────────────────────────────────
# CELL 2: Set Credentials (ALREADY FILLED IN FOR YOU!)
# ───────────────────────────────────────────────────────────────────────────
# Copy everything between the arrows and paste into Cell 2 in Google Colab

import os
os.environ['SUPABASE_URL'] = 'https://luwfbkxjbogfapgkznve.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1d2Zia3hqYm9nZmFwZ2t6bnZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDEwNjk2NCwiZXhwIjoyMDc5NjgyOTY0fQ.DvYNotPUz0UTzaYkXjRtK1KPcLFpRjj--WmCuf1drbI'

# ───────────────────────────────────────────────────────────────────────────
# CELL 3: Load Scraper Code
# ───────────────────────────────────────────────────────────────────────────
# Copy everything from the arrows below and paste into Cell 3 in Google Colab

import os
import re
import time
import requests
from io import BytesIO
from PIL import Image
from urllib.parse import quote_plus, urlparse
from bs4 import BeautifulSoup
from supabase import create_client, Client
from typing import List, Dict, Optional, Set
import json

class UniqueGoogleImagesScraper:
    """Scraper that ensures each village gets UNIQUE images only"""
    
    def __init__(self):
        # Initialize Supabase
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_key:
            raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
        # Quality settings
        self.MIN_WIDTH = 800
        self.MIN_HEIGHT = 500
        self.MAX_IMAGES_PER_VILLAGE = 6
        self.REQUEST_DELAY = 3.0  # Seconds between requests
        
        # Track ALL image URLs already in database
        self.existing_image_urls: Set[str] = set()
        self.load_existing_images()
        
        # Track new assignments in this session
        self.session_assigned_urls: Set[str] = set()
        
        # Statistics
        self.stats = {
            'attempted': 0,
            'successful': 0,
            'failed': 0,
            'duplicate_urls_skipped': 0,
            'low_quality_skipped': 0,
            'no_results': 0
        }
    
    def load_existing_images(self):
        """Load ALL existing image URLs from database to prevent duplicates"""
        print("🔍 Loading existing image URLs from database...")
        
        all_villages = []
        page = 0
        page_size = 1000
        
        while True:
            from_idx = page * page_size
            to_idx = from_idx + page_size - 1
            
            result = self.supabase.table('retirement_villages').select('images').range(from_idx, to_idx).execute()
            
            if result.data:
                all_villages.extend(result.data)
                if len(result.data) < page_size:
                    break
                page += 1
            else:
                break
        
        # Extract all image URLs
        for village in all_villages:
            if village.get('images'):
                for img_url in village['images']:
                    self.existing_image_urls.add(img_url)
        
        print(f"✅ Loaded {len(self.existing_image_urls)} existing image URLs")
    
    def is_url_unique(self, url: str) -> bool:
        """Check if URL is unique (not already in database or this session)"""
        return (
            url not in self.existing_image_urls and 
            url not in self.session_assigned_urls
        )
    
    def build_specific_search_query(self, village: Dict) -> str:
        """Build a SPECIFIC search query using the village's exact name and location."""
        parts = []
        
        # Add village name (most important)
        if village.get('name'):
            parts.append(village['name'])
        
        # Add "retirement village" keywords
        parts.append('retirement village')
        
        # Add city/location
        if village.get('city'):
            parts.append(village['city'])
        
        # Add state
        if village.get('state'):
            parts.append(village['state'])
        
        query = ' '.join(parts)
        print(f"   🔍 Search query: \"{query}\"")
        return query
    
    def search_google_images(self, query: str) -> List[str]:
        """Search Google Images and extract image URLs"""
        try:
            # Build Google Images search URL
            encoded_query = quote_plus(query)
            url = f"https://www.google.com/search?q={encoded_query}&tbm=isch&tbs=isz:l"
            
            # Make request with realistic headers
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code != 200:
                print(f"   ⚠️  Google returned status {response.status_code}")
                return []
            
            # Parse HTML
            soup = BeautifulSoup(response.text, 'lxml')
            
            # Extract image URLs from multiple possible formats
            image_urls = []
            
            # Method 1: Parse from JavaScript data
            scripts = soup.find_all('script')
            for script in scripts:
                if script.string and 'AF_initDataCallback' in script.string:
                    # Extract URLs from JS data structures
                    matches = re.findall(r'https?://[^\s,"\'\)]+\.(?:jpg|jpeg|png|webp|gif)', script.string)
                    image_urls.extend(matches)
            
            # Method 2: Parse from img tags (thumbnails might have data attributes)
            for img in soup.find_all('img'):
                if img.get('src') and img['src'].startswith('http'):
                    image_urls.append(img['src'])
                if img.get('data-src') and img['data-src'].startswith('http'):
                    image_urls.append(img['data-src'])
            
            # Remove duplicates and filter
            unique_urls = list(set(image_urls))
            
            # Filter out Google's own images (logos, UI elements)
            filtered_urls = [
                url for url in unique_urls
                if 'gstatic.com' not in url and 
                   'google.com/images' not in url and
                   'encrypted-tbn' not in url  # Exclude thumbnails
            ]
            
            print(f"   📸 Found {len(filtered_urls)} potential images")
            return filtered_urls[:30]  # Return max 30 candidates
            
        except Exception as e:
            print(f"   ❌ Search error: {e}")
            return []
    
    def validate_image(self, url: str) -> Optional[Dict]:
        """Download and validate image quality"""
        try:
            # Check if URL is unique FIRST (before downloading)
            if not self.is_url_unique(url):
                return None
            
            # Download image
            response = requests.get(url, timeout=10, stream=True)
            
            if response.status_code != 200:
                return None
            
            # Validate content type
            content_type = response.headers.get('content-type', '')
            if 'image' not in content_type:
                return None
            
            # Load image to check dimensions
            img = Image.open(BytesIO(response.content))
            width, height = img.size
            
            # Check minimum dimensions
            if width < self.MIN_WIDTH or height < self.MIN_HEIGHT:
                return None
            
            # Check aspect ratio (avoid banners, logos)
            aspect_ratio = width / height
            if aspect_ratio > 4 or aspect_ratio < 0.25:
                return None
            
            # Check file size (avoid tiny files)
            content_length = len(response.content)
            if content_length < 50000:  # 50KB minimum
                return None
            
            return {
                'url': url,
                'width': width,
                'height': height,
                'size': content_length,
                'format': img.format
            }
            
        except Exception as e:
            return None
    
    def scrape_village(self, village: Dict) -> bool:
        """Scrape images for a single village with uniqueness validation"""
        try:
            village_id = village['id']
            village_name = village.get('name', 'Unknown')
            
            print(f"\n{'='*80}")
            print(f"🏘️  Processing: {village_name}")
            print(f"{'='*80}")
            
            self.stats['attempted'] += 1
            
            # Build specific search query
            query = self.build_specific_search_query(village)
            
            # Search Google Images
            print("   🌐 Searching Google Images...")
            image_urls = self.search_google_images(query)
            
            if not image_urls:
                print("   ⚠️  No images found")
                self.stats['no_results'] += 1
                return False
            
            # Validate images and collect valid ones
            print(f"   🔍 Validating {len(image_urls)} candidates...")
            valid_images = []
            
            for url in image_urls:
                # Check uniqueness first (fast)
                if not self.is_url_unique(url):
                    print(f"   ⏭️  Skipping duplicate URL: {url[:60]}...")
                    self.stats['duplicate_urls_skipped'] += 1
                    continue
                
                # Validate image (slow - downloads)
                image_info = self.validate_image(url)
                
                if image_info:
                    valid_images.append(image_info['url'])
                    print(f"   ✅ Valid image: {image_info['width']}×{image_info['height']}px")
                    
                    # Stop if we have enough
                    if len(valid_images) >= self.MAX_IMAGES_PER_VILLAGE:
                        break
                else:
                    self.stats['low_quality_skipped'] += 1
            
            # Update database if we found valid images
            if valid_images:
                print(f"   💾 Saving {len(valid_images)} images to database...")
                
                result = self.supabase.table('retirement_villages').update({
                    'images': valid_images
                }).eq('id', village_id).execute()
                
                if result.data:
                    # Mark these URLs as assigned
                    for url in valid_images:
                        self.session_assigned_urls.add(url)
                        self.existing_image_urls.add(url)
                    
                    print(f"   ✅ SUCCESS: Saved {len(valid_images)} unique images")
                    self.stats['successful'] += 1
                    return True
                else:
                    print(f"   ❌ Database update failed")
                    self.stats['failed'] += 1
                    return False
            else:
                print(f"   ⚠️  No valid/unique images found")
                self.stats['failed'] += 1
                return False
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
            self.stats['failed'] += 1
            return False
    
    def get_villages_needing_images(self, limit: Optional[int] = None) -> List[Dict]:
        """Get villages that need images (no images OR had duplicates removed)"""
        print("🔍 Fetching villages that need images...")
        
        all_villages = []
        page = 0
        page_size = 1000
        
        while True:
            from_idx = page * page_size
            to_idx = from_idx + page_size - 1
            
            result = self.supabase.table('retirement_villages').select(
                'id, name, operator, city, state, images'
            ).eq('status', 'approved').range(from_idx, to_idx).execute()
            
            if result.data:
                all_villages.extend(result.data)
                if len(result.data) < page_size:
                    break
                page += 1
            else:
                break
        
        # Filter for villages with no images or very few images
        villages_needing_images = [
            v for v in all_villages 
            if not v.get('images') or len(v.get('images', [])) < 2
        ]
        
        print(f"✅ Found {len(villages_needing_images)} villages needing images")
        
        if limit:
            return villages_needing_images[:limit]
        return villages_needing_images
    
    def run_batch(self, villages: List[Dict], delay: float = 3.0):
        """Process a batch of villages with rate limiting"""
        total = len(villages)
        
        print(f"\n{'#'*80}")
        print(f"# STARTING BATCH: {total} villages")
        print(f"# Rate limit: {delay} seconds between villages")
        print(f"{'#'*80}\n")
        
        for idx, village in enumerate(villages, 1):
            print(f"\n[{idx}/{total}] Village {idx}:")
            
            success = self.scrape_village(village)
            
            # Delay between villages (except last one)
            if idx < total:
                print(f"\n⏸  Waiting {delay} seconds...")
                time.sleep(delay)
        
        # Print summary
        print(f"\n{'='*80}")
        print("📊 BATCH COMPLETE - STATISTICS")
        print(f"{'='*80}")
        print(f"Attempted:              {self.stats['attempted']}")
        print(f"✅ Successful:          {self.stats['successful']}")
        print(f"❌ Failed:              {self.stats['failed']}")
        print(f"⏭️  Duplicate URLs:      {self.stats['duplicate_urls_skipped']}")
        print(f"⏭️  Low quality:         {self.stats['low_quality_skipped']}")
        print(f"⚠️  No results:          {self.stats['no_results']}")
        print(f"📈 Success rate:        {self.stats['successful']/max(self.stats['attempted'],1)*100:.1f}%")
        print(f"🎯 Unique URLs added:   {len(self.session_assigned_urls)}")
        print(f"{'='*80}\n")


# Display banner
print("""
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║  🔧 GOOGLE IMAGES SCRAPER V2 - UNIQUE IMAGES ONLY                        ║
║                                                                           ║
║  ✅ Ensures each village gets UNIQUE images                              ║
║  ✅ Uses SPECIFIC village names in search queries                        ║
║  ✅ Validates uniqueness across entire database                          ║
║  ✅ Prevents generic operator images                                     ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
""")

print("\n🎯 SCRAPER LOADED AND READY!\n")

# ───────────────────────────────────────────────────────────────────────────
# CELL 4: Test Run (5 villages)
# ───────────────────────────────────────────────────────────────────────────
# Copy everything between the arrows and paste into Cell 4 in Google Colab

scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images(limit=5)
print(f"\n🧪 TESTING on {len(villages)} villages...")
scraper.run_batch(villages, delay=3.0)

# ───────────────────────────────────────────────────────────────────────────
# CELL 5: Production Run (ALL villages - Only run after verifying test!)
# ───────────────────────────────────────────────────────────────────────────
# Copy everything between the arrows and paste into Cell 5 in Google Colab

scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images()
print(f"\n🚀 PRODUCTION RUN: Processing {len(villages)} villages...")
print(f"⏱️  Estimated time: {(len(villages) * 3) / 60:.1f} minutes\n")
scraper.run_batch(villages, delay=3.0)
