"""
RetirePath Village Image Scraper
=================================

Extracts images from retirement village websites and updates the database.

This scraper:
1. Reads villages from Supabase that have websites but no images
2. Visits each website and extracts relevant images
3. Filters for high-quality, appropriate images
4. Updates the database with image URLs

USAGE:
    python village_image_scraper.py

REQUIREMENTS:
    pip install requests beautifulsoup4 pillow python-dotenv supabase selenium

IMPORTANT:
    - Check robots.txt before scraping
    - Respect rate limits
    - Images should be publicly accessible
    - Consider copyright and terms of service
"""

import os
import sys
import time
import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client, Client
import logging
from typing import List, Dict, Optional
import re
from io import BytesIO
from PIL import Image

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('image_scraper.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class VillageImageScraper:
    """Scrapes images from retirement village websites"""
    
    def __init__(self):
        """Initialize the scraper with Supabase connection"""
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        
        # HTTP session with headers to avoid being blocked
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
        
        # Image filtering criteria
        self.MIN_WIDTH = 800  # Minimum image width
        self.MIN_HEIGHT = 500  # Minimum image height
        self.MAX_IMAGES_PER_VILLAGE = 8  # Maximum images to save
        
        # Statistics
        self.stats = {
            'villages_processed': 0,
            'villages_updated': 0,
            'images_found': 0,
            'errors': 0
        }
    
    def get_villages_without_images(self, limit: Optional[int] = None, state: Optional[str] = None, operator: Optional[str] = None) -> List[Dict]:
        """
        Fetch villages that have websites but no images
        
        Args:
            limit: Maximum number of villages to fetch
            state: Filter by state (e.g., 'NSW', 'VIC')
            operator: Filter by operator name
            
        Returns:
            List of village dictionaries
        """
        try:
            logger.info("Fetching villages without images from database...")
            
            # Build query
            query = self.supabase.table('retirement_villages').select('*')
            
            # Filter: must have website and approved status
            query = query.eq('status', 'approved')
            query = query.not_.is_('website', 'null')
            query = query.neq('website', '')
            
            # Filter: no images or empty images array
            # This will get villages where images is null or an empty array
            
            # Additional filters
            if state:
                query = query.eq('state', state)
            
            if operator:
                query = query.ilike('operator', f'%{operator}%')
            
            # Apply limit
            if limit:
                query = query.limit(limit)
            
            # Execute query
            response = query.execute()
            
            # Filter for villages without images (do this in Python since Supabase query might be tricky)
            villages = []
            for village in response.data:
                images = village.get('images')
                # Include if images is None, empty array, or array with only empty strings
                if not images or images == [] or all(not img or img.strip() == '' for img in images):
                    villages.append(village)
            
            logger.info(f"Found {len(villages)} villages without images")
            return villages
            
        except Exception as e:
            logger.error(f"Error fetching villages: {e}")
            return []
    
    def is_valid_image_url(self, url: str) -> bool:
        """Check if URL is likely an image based on extension"""
        image_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
        parsed = urlparse(url.lower())
        path = parsed.path
        
        # Remove query parameters for checking extension
        path_without_query = path.split('?')[0]
        
        return any(path_without_query.endswith(ext) for ext in image_extensions)
    
    def check_image_dimensions(self, image_url: str) -> Optional[tuple]:
        """
        Download image and check its dimensions
        
        Args:
            image_url: URL of the image to check
            
        Returns:
            Tuple of (width, height) if valid, None otherwise
        """
        try:
            # Download image with timeout
            response = self.session.get(image_url, timeout=10, stream=True)
            response.raise_for_status()
            
            # Check content type
            content_type = response.headers.get('Content-Type', '')
            if 'image' not in content_type:
                return None
            
            # Load image and get dimensions
            image = Image.open(BytesIO(response.content))
            width, height = image.size
            
            return (width, height)
            
        except Exception as e:
            logger.debug(f"Error checking image dimensions for {image_url}: {e}")
            return None
    
    def extract_images_from_page(self, url: str, village_name: str) -> List[str]:
        """
        Extract relevant images from a webpage
        
        Args:
            url: Website URL to scrape
            village_name: Name of the village (for filtering)
            
        Returns:
            List of image URLs
        """
        try:
            logger.info(f"Scraping images from: {url}")
            
            # Fetch webpage
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            image_urls = []
            
            # Strategy 1: Look for gallery images
            gallery_classes = [
                'gallery', 'slider', 'carousel', 'slideshow', 
                'image-gallery', 'photo-gallery', 'lightbox',
                'property-images', 'village-images', 'photos'
            ]
            
            for gallery_class in gallery_classes:
                gallery_divs = soup.find_all(['div', 'section', 'ul'], class_=re.compile(gallery_class, re.I))
                for gallery in gallery_divs:
                    imgs = gallery.find_all('img')
                    for img in imgs:
                        src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                        if src:
                            full_url = urljoin(url, src)
                            if self.is_valid_image_url(full_url):
                                image_urls.append(full_url)
            
            # Strategy 2: Look for hero/banner images
            hero_selectors = [
                'hero', 'banner', 'header-image', 'main-image',
                'featured-image', 'cover-image'
            ]
            
            for hero_class in hero_selectors:
                hero_imgs = soup.find_all('img', class_=re.compile(hero_class, re.I))
                for img in hero_imgs:
                    src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                    if src:
                        full_url = urljoin(url, src)
                        if self.is_valid_image_url(full_url):
                            image_urls.append(full_url)
            
            # Strategy 3: Look for all images with certain patterns in alt/title
            relevant_keywords = [
                'retirement', 'village', 'community', 'facility', 
                'building', 'garden', 'pool', 'exterior', 'interior',
                'apartment', 'unit', 'home', 'residence'
            ]
            
            all_imgs = soup.find_all('img')
            for img in all_imgs:
                alt_text = (img.get('alt') or '').lower()
                title_text = (img.get('title') or '').lower()
                src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                
                # Check if alt/title contains relevant keywords
                if any(keyword in alt_text or keyword in title_text for keyword in relevant_keywords):
                    if src:
                        full_url = urljoin(url, src)
                        if self.is_valid_image_url(full_url):
                            image_urls.append(full_url)
            
            # Strategy 4: Background images in CSS
            elements_with_bg = soup.find_all(style=re.compile(r'background-image'))
            for element in elements_with_bg:
                style = element.get('style', '')
                # Extract URL from background-image: url('...')
                match = re.search(r'url\([\'"]?([^\'"]+)[\'"]?\)', style)
                if match:
                    bg_url = match.group(1)
                    full_url = urljoin(url, bg_url)
                    if self.is_valid_image_url(full_url):
                        image_urls.append(full_url)
            
            # Remove duplicates while preserving order
            unique_urls = []
            seen = set()
            for img_url in image_urls:
                if img_url not in seen:
                    seen.add(img_url)
                    unique_urls.append(img_url)
            
            logger.info(f"Found {len(unique_urls)} potential images")
            
            # Filter images by dimensions
            valid_images = []
            for img_url in unique_urls[:20]:  # Check max 20 images to save time
                dimensions = self.check_image_dimensions(img_url)
                if dimensions:
                    width, height = dimensions
                    if width >= self.MIN_WIDTH and height >= self.MIN_HEIGHT:
                        valid_images.append(img_url)
                        logger.info(f"✓ Valid image: {img_url} ({width}x{height})")
                        
                        # Stop if we have enough images
                        if len(valid_images) >= self.MAX_IMAGES_PER_VILLAGE:
                            break
                
                # Small delay between image checks
                time.sleep(0.2)
            
            logger.info(f"Found {len(valid_images)} high-quality images")
            return valid_images
            
        except requests.RequestException as e:
            logger.warning(f"Error fetching {url}: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error scraping {url}: {e}")
            return []
    
    def update_village_images(self, village_id: str, image_urls: List[str]) -> bool:
        """
        Update village in database with scraped images
        
        Args:
            village_id: Village UUID
            image_urls: List of image URLs to save
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Updating village {village_id} with {len(image_urls)} images")
            
            response = self.supabase.table('retirement_villages').update({
                'images': image_urls,
                'updated_at': time.strftime('%Y-%m-%d %H:%M:%S')
            }).eq('id', village_id).execute()
            
            if response.data:
                logger.info(f"✓ Successfully updated village {village_id}")
                return True
            else:
                logger.error(f"Failed to update village {village_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error updating village {village_id}: {e}")
            return False
    
    def scrape_village(self, village: Dict) -> bool:
        """
        Scrape images for a single village
        
        Args:
            village: Village dictionary from database
            
        Returns:
            True if images were found and updated, False otherwise
        """
        village_id = village.get('id')
        village_name = village.get('name')
        website = village.get('website')
        
        logger.info(f"\n{'='*80}")
        logger.info(f"Processing: {village_name}")
        logger.info(f"Website: {website}")
        logger.info(f"{'='*80}")
        
        try:
            # Extract images from website
            images = self.extract_images_from_page(website, village_name)
            
            if images:
                # Update database
                success = self.update_village_images(village_id, images)
                if success:
                    self.stats['villages_updated'] += 1
                    self.stats['images_found'] += len(images)
                    return True
            else:
                logger.warning(f"No suitable images found for {village_name}")
            
            return False
            
        except Exception as e:
            logger.error(f"Error processing village {village_name}: {e}")
            self.stats['errors'] += 1
            return False
        finally:
            self.stats['villages_processed'] += 1
    
    def run(self, limit: Optional[int] = None, state: Optional[str] = None, 
            operator: Optional[str] = None, delay: float = 2.0):
        """
        Main scraping process
        
        Args:
            limit: Maximum number of villages to process
            state: Filter by state
            operator: Filter by operator
            delay: Delay between requests in seconds (be respectful!)
        """
        logger.info("="*80)
        logger.info("RetirePath Village Image Scraper")
        logger.info("="*80)
        
        # Fetch villages
        villages = self.get_villages_without_images(limit, state, operator)
        
        if not villages:
            logger.warning("No villages found to process")
            return
        
        logger.info(f"\nStarting to scrape {len(villages)} villages...")
        logger.info(f"Delay between requests: {delay}s")
        logger.info(f"Minimum image size: {self.MIN_WIDTH}x{self.MIN_HEIGHT}")
        logger.info(f"Maximum images per village: {self.MAX_IMAGES_PER_VILLAGE}")
        
        # Process each village
        for i, village in enumerate(villages, 1):
            logger.info(f"\n[{i}/{len(villages)}] Processing {village.get('name')}...")
            
            self.scrape_village(village)
            
            # Respectful delay between requests
            if i < len(villages):
                logger.info(f"Waiting {delay}s before next request...")
                time.sleep(delay)
        
        # Print final statistics
        self.print_statistics()
    
    def print_statistics(self):
        """Print scraping statistics"""
        logger.info("\n" + "="*80)
        logger.info("SCRAPING COMPLETE - STATISTICS")
        logger.info("="*80)
        logger.info(f"Villages processed: {self.stats['villages_processed']}")
        logger.info(f"Villages updated: {self.stats['villages_updated']}")
        logger.info(f"Total images found: {self.stats['images_found']}")
        logger.info(f"Errors encountered: {self.stats['errors']}")
        
        if self.stats['villages_updated'] > 0:
            avg_images = self.stats['images_found'] / self.stats['villages_updated']
            logger.info(f"Average images per village: {avg_images:.1f}")
        
        success_rate = (self.stats['villages_updated'] / self.stats['villages_processed'] * 100) if self.stats['villages_processed'] > 0 else 0
        logger.info(f"Success rate: {success_rate:.1f}%")
        logger.info("="*80)


def main():
    """Main entry point"""
    print("""
╔════════════════════════════════════════════════════════════════╗
║          RetirePath Village Image Scraper v1.0                 ║
║                                                                ║
║  This tool scrapes images from retirement village websites    ║
║  and updates your Supabase database.                          ║
╚════════════════════════════════════════════════════════════════╝
    """)
    
    # Configuration options
    print("\nConfiguration Options:")
    print("1. Scrape ALL villages (slow, could take hours)")
    print("2. Scrape specific state")
    print("3. Scrape specific operator")
    print("4. Scrape limited number (testing)")
    print("5. Scrape top operators first (recommended)")
    
    choice = input("\nEnter your choice (1-5): ").strip()
    
    scraper = VillageImageScraper()
    
    if choice == "1":
        confirm = input("\nThis will scrape ALL villages. This may take several hours. Continue? (yes/no): ")
        if confirm.lower() == 'yes':
            scraper.run(delay=2.0)
        else:
            print("Cancelled.")
    
    elif choice == "2":
        state = input("Enter state code (NSW, VIC, QLD, SA, WA, TAS, ACT, NT): ").strip().upper()
        scraper.run(state=state, delay=2.0)
    
    elif choice == "3":
        operator = input("Enter operator name (e.g., 'Stockland', 'Aveo'): ").strip()
        scraper.run(operator=operator, delay=2.0)
    
    elif choice == "4":
        limit = int(input("Enter number of villages to scrape (e.g., 10): ").strip())
        scraper.run(limit=limit, delay=2.0)
    
    elif choice == "5":
        print("\nScraping top operators...")
        top_operators = [
            'Stockland',
            'Aveo',
            'Lendlease',
            'Ingenia',
            'Retire Australia',
            'Lifestyle Communities',
            'Gateway Lifestyle',
            'Hometown Australia',
            'Living Choice'
        ]
        
        for operator in top_operators:
            print(f"\n{'='*60}")
            print(f"Scraping: {operator}")
            print(f"{'='*60}")
            scraper.run(operator=operator, delay=2.0)
            print(f"\nCompleted {operator}. Moving to next operator...\n")
    
    else:
        print("Invalid choice. Exiting.")
        return
    
    print("\n✓ Scraping complete! Check image_scraper.log for details.")


if __name__ == "__main__":
    main()
