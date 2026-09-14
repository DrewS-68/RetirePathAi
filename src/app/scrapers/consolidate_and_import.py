"""
Data Consolidation and Supabase Import Script
Combines scraped data, removes duplicates, and imports to Supabase

Requirements:
- pip install pandas supabase geopy python-dotenv
"""

import pandas as pd
import json
from supabase import create_client, Client
from typing import List, Dict
import os
from dotenv import load_dotenv
from geopy.geocoders import Nominatim
import time

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")
    print("\\nCreate a .env file with:")
    print("SUPABASE_URL=your_supabase_url")
    print("SUPABASE_SERVICE_ROLE_KEY=your_service_role_key")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

class DataConsolidator:
    def __init__(self):
        self.all_villages = []
        self.geocoder = Nominatim(user_agent="retirepath_geocoder")
        
    def load_scraped_data(self):
        """Load all scraped CSV/JSON files"""
        print("📂 Loading scraped data files...")
        
        files = [
            'retirement_living_villages.csv',
            'aged_care_guide_villages.csv',
            'operator_villages.csv',
        ]
        
        for filename in files:
            if os.path.exists(filename):
                try:
                    df = pd.read_csv(filename)
                    print(f"   ✅ Loaded {len(df)} villages from {filename}")
                    self.all_villages.append(df)
                except Exception as e:
                    print(f"   ⚠️  Error loading {filename}: {e}")
        
        if not self.all_villages:
            print("   ⚠️  No data files found!")
            return None
        
        # Combine all dataframes
        combined_df = pd.concat(self.all_villages, ignore_index=True)
        print(f"\\n📊 Total villages loaded: {len(combined_df)}")
        
        return combined_df
    
    def remove_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove duplicate villages based on name + postcode"""
        print("\\n🔍 Removing duplicates...")
        
        before_count = len(df)
        
        # Remove exact duplicates
        df = df.drop_duplicates(subset=['name', 'postcode'], keep='first')
        
        after_count = len(df)
        removed = before_count - after_count
        
        print(f"   ✅ Removed {removed} duplicates")
        print(f"   📊 Unique villages: {after_count}")
        
        return df
    
    def add_geocoding(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add latitude/longitude coordinates to villages"""
        print("\\n🗺️  Adding geocoding (lat/lng coordinates)...")
        print("   ⚠️  This may take a while for large datasets...")
        
        def geocode_address(row):
            """Geocode a single address"""
            if pd.notna(row.get('latitude')) and pd.notna(row.get('longitude')):
                return row  # Already has coordinates
            
            try:
                # Build address string
                address_parts = []
                if pd.notna(row.get('location')):
                    address_parts.append(str(row['location']))
                if pd.notna(row.get('suburb')):
                    address_parts.append(str(row['suburb']))
                if pd.notna(row.get('postcode')):
                    address_parts.append(str(row['postcode']))
                if pd.notna(row.get('state')):
                    address_parts.append(str(row['state']))
                address_parts.append('Australia')
                
                address = ', '.join(address_parts)
                
                # Geocode
                location = self.geocoder.geocode(address, timeout=10)
                
                if location:
                    row['latitude'] = location.latitude
                    row['longitude'] = location.longitude
                    print(f"   ✅ Geocoded: {row.get('name', 'Unknown')}")
                else:
                    print(f"   ⚠️  Could not geocode: {row.get('name', 'Unknown')}")
                
                time.sleep(1)  # Rate limiting for geocoding service
                
            except Exception as e:
                print(f"   ⚠️  Geocoding error for {row.get('name', 'Unknown')}: {e}")
            
            return row
        
        # Apply geocoding to each row
        df = df.apply(geocode_address, axis=1)
        
        geocoded_count = df[['latitude', 'longitude']].notna().all(axis=1).sum()
        print(f"\\n   📊 Successfully geocoded: {geocoded_count}/{len(df)} villages")
        
        return df
    
    def validate_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate and clean data before import"""
        print("\\n✅ Validating data...")
        
        before_count = len(df)
        
        # Remove rows without essential fields
        df = df.dropna(subset=['name', 'suburb', 'postcode', 'state'])
        
        after_count = len(df)
        removed = before_count - after_count
        
        if removed > 0:
            print(f"   ⚠️  Removed {removed} villages with missing essential fields")
        
        # Clean postcode (ensure 4 digits)
        df['postcode'] = df['postcode'].astype(str).str.strip().str.zfill(4)
        
        # Clean state (uppercase)
        df['state'] = df['state'].str.upper().str.strip()
        
        # Validate states
        valid_states = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']
        df = df[df['state'].isin(valid_states)]
        
        print(f"   ✅ {len(df)} villages validated and ready for import")
        
        return df
    
    def prepare_for_import(self, df: pd.DataFrame) -> List[Dict]:
        """Convert dataframe to format ready for Supabase"""
        print("\\n📦 Preparing data for import...")
        
        villages = []
        
        for _, row in df.iterrows():
            village = {
                # Basic information
                'name': row.get('name'),
                'operator': row.get('operator'),
                'location': row.get('location'),
                'suburb': row.get('suburb'),
                'postcode': row.get('postcode'),
                'state': row.get('state'),
                'latitude': float(row['latitude']) if pd.notna(row.get('latitude')) else None,
                'longitude': float(row['longitude']) if pd.notna(row.get('longitude')) else None,
                
                # Village type
                'village_type': row.get('village_type'),
                'care_level': row.get('care_level'),
                
                # Pricing
                'entry_price_min': int(row['entry_price_min']) if pd.notna(row.get('entry_price_min')) else None,
                'entry_price_max': int(row['entry_price_max']) if pd.notna(row.get('entry_price_max')) else None,
                'monthly_fees_min': int(row['monthly_fees_min']) if pd.notna(row.get('monthly_fees_min')) else None,
                'monthly_fees_max': int(row['monthly_fees_max']) if pd.notna(row.get('monthly_fees_max')) else None,
                
                # Features (convert to JSON arrays if needed)
                'amenities': row.get('amenities', []) if isinstance(row.get('amenities'), list) else [],
                'care_services': row.get('care_services', []) if isinstance(row.get('care_services'), list) else [],
                'activities': row.get('activities', []) if isinstance(row.get('activities'), list) else [],
                
                # Attributes
                'pet_friendly': bool(row.get('pet_friendly', False)),
                'total_units': int(row['total_units']) if pd.notna(row.get('total_units')) else None,
                
                # Contact
                'contact_phone': row.get('phone'),
                'contact_email': row.get('email'),
                'website': row.get('website'),
                
                # Description
                'description': row.get('description'),
                
                # Admin fields
                'status': 'pending',  # All scraped villages need review
                'source': row.get('source', 'scraper'),
                'verified': False,
            }
            
            villages.append(village)
        
        print(f"   ✅ Prepared {len(villages)} villages for import")
        return villages
    
    def import_to_supabase(self, villages: List[Dict]):
        """Import villages to Supabase"""
        print("\\n🚀 Importing to Supabase...")
        print(f"   📊 Total villages to import: {len(villages)}")
        
        # Import in batches of 100
        batch_size = 100
        total_imported = 0
        total_errors = 0
        
        for i in range(0, len(villages), batch_size):
            batch = villages[i:i + batch_size]
            
            try:
                response = supabase.table('retirement_villages').insert(batch).execute()
                total_imported += len(batch)
                print(f"   ✅ Imported batch {i//batch_size + 1}: {len(batch)} villages")
            except Exception as e:
                total_errors += len(batch)
                print(f"   ❌ Error importing batch {i//batch_size + 1}: {e}")
                
                # Try importing one by one to identify problematic records
                for village in batch:
                    try:
                        supabase.table('retirement_villages').insert([village]).execute()
                        total_imported += 1
                    except Exception as e2:
                        print(f"      ⚠️  Failed: {village.get('name', 'Unknown')} - {e2}")
                        total_errors += 1
        
        print(f"\\n📊 Import Summary:")
        print(f"   ✅ Successfully imported: {total_imported}")
        print(f"   ❌ Errors: {total_errors}")
        print(f"   📈 Success rate: {(total_imported / len(villages) * 100):.1f}%")


def main():
    """Main workflow"""
    print("="*60)
    print("📦 RetirePath Data Consolidation & Import")
    print("="*60)
    print()
    
    consolidator = DataConsolidator()
    
    # Load scraped data
    df = consolidator.load_scraped_data()
    if df is None or len(df) == 0:
        print("\\n❌ No data to import!")
        return
    
    # Remove duplicates
    df = consolidator.remove_duplicates(df)
    
    # Validate data
    df = consolidator.validate_data(df)
    
    # Optional: Add geocoding (can be slow)
    geocode_choice = input("\\n🗺️  Add geocoding (lat/lng)? This may take a while. (yes/no): ")
    if geocode_choice.lower() == 'yes':
        df = consolidator.add_geocoding(df)
    
    # Prepare for import
    villages = consolidator.prepare_for_import(df)
    
    # Confirm import
    print(f"\\n⚠️  About to import {len(villages)} villages to Supabase")
    confirm = input("Continue with import? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("Import cancelled.")
        
        # Save to CSV for manual review
        df.to_csv('consolidated_villages_ready_to_import.csv', index=False)
        print("\\n💾 Data saved to consolidated_villages_ready_to_import.csv")
        print("   Review and manually import if preferred")
        return
    
    # Import to Supabase
    consolidator.import_to_supabase(villages)
    
    print("\\n" + "="*60)
    print("✅ Process complete!")
    print("="*60)
    print()
    print("🚀 Next steps:")
    print("   1. Login to Supabase Dashboard")
    print("   2. Go to retirement_villages table")
    print("   3. Review pending submissions")
    print("   4. Approve high-quality listings")
    print()


if __name__ == "__main__":
    main()
