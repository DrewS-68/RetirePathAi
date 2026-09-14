import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Database, CheckCircle2, XCircle, Loader2, Upload, FileImage } from 'lucide-react';

export function StorageSetup() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [bucketInfo, setBucketInfo] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const checkStorageStatus = async () => {
    try {
      setLoading(true);
      setError('');
      setStatus('Checking storage status...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/storage/info`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setBucketInfo(data);
      setStatus(data.exists ? '✅ Storage bucket is ready!' : '⚠️ Storage bucket not found');
      
    } catch (err: any) {
      console.error('Error checking storage:', err);
      setError(err.message || 'Failed to check storage status');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const initializeStorage = async () => {
    try {
      setLoading(true);
      setError('');
      setStatus('Initializing storage bucket...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/storage/init`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setBucketInfo({
        bucketName: data.bucket,
        exists: true,
        publicUrl: data.publicUrl
      });
      
      setStatus(`✅ ${data.message}`);
      
    } catch (err: any) {
      console.error('Error initializing storage:', err);
      setError(err.message || 'Failed to initialize storage');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">🗄️ Storage Setup</h1>
        <p className="text-muted-foreground">
          Initialize Supabase Storage for village images
        </p>
      </div>

      {/* Storage Status Card */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="size-8 text-blue-600" />
          <div>
            <h2 className="text-2xl">Storage Bucket Status</h2>
            <p className="text-sm text-muted-foreground">
              Check if the storage bucket exists and initialize if needed
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={checkStorageStatus}
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Database className="size-4 mr-2" />
              )}
              Check Status
            </Button>

            <Button
              onClick={initializeStorage}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4 mr-2" />
              )}
              Initialize Storage
            </Button>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`p-4 rounded-lg ${
              status.includes('✅') 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : status.includes('⚠️')
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <p>{status}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
              <div className="flex items-center gap-2">
                <XCircle className="size-5" />
                <p><strong>Error:</strong> {error}</p>
              </div>
            </div>
          )}

          {/* Bucket Info */}
          {bucketInfo && (
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="text-sm mb-2">Bucket Information:</h3>
              <div className="text-sm font-mono space-y-1">
                <div className="flex items-center gap-2">
                  {bucketInfo.exists ? (
                    <CheckCircle2 className="size-4 text-green-600" />
                  ) : (
                    <XCircle className="size-4 text-red-600" />
                  )}
                  <span><strong>Status:</strong> {bucketInfo.exists ? 'Exists' : 'Not Found'}</span>
                </div>
                {bucketInfo.bucketName && (
                  <div><strong>Bucket Name:</strong> {bucketInfo.bucketName}</div>
                )}
                {bucketInfo.publicUrl && (
                  <div className="break-all">
                    <strong>Public URL:</strong> {bucketInfo.publicUrl}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Instructions Card */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <FileImage className="size-6 text-purple-600" />
          <h2 className="text-xl">Next Steps: Image Scraping</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm mb-2">📋 Setup Instructions:</h3>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Click "<strong>Initialize Storage</strong>" above to create the bucket</li>
              <li>Wait for the success message</li>
              <li>Open your Google Colab notebook</li>
              <li>Upload the villages CSV file (from Village Directory tab)</li>
              <li>Run the updated scraping script (provided below)</li>
            </ol>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-sm mb-2">🔧 What This Does:</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Creates a <strong>public storage bucket</strong> called "village-images"</li>
              <li>Sets up <strong>proper access policies</strong> for image uploads</li>
              <li>Allows the scraping script to <strong>upload images</strong> directly to Supabase</li>
              <li>Provides <strong>permanent URLs</strong> for all village images</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm mb-2">✅ Benefits:</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li><strong>Reliable:</strong> Images hosted on your Supabase account</li>
              <li><strong>Fast:</strong> CDN-backed storage for quick loading</li>
              <li><strong>No External Dependencies:</strong> No broken links from third-party sites</li>
              <li><strong>Full Control:</strong> Manage all images from your dashboard</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Python Script Card */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Upload className="size-6 text-orange-600" />
          <h2 className="text-xl">Updated Python Scraping Script</h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Copy this script to your Google Colab notebook. It will scrape images from Google Images 
            and upload them directly to your Supabase Storage bucket.
          </p>

          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap">
{`# Install required packages
!pip install requests beautifulsoup4 pillow supabase

import pandas as pd
import requests
from bs4 import BeautifulSoup
import time
from io import BytesIO
from PIL import Image
import base64
from supabase import create_client, Client

# Configuration
SUPABASE_URL = "https://${projectId}.supabase.co"
SUPABASE_KEY = "YOUR_SERVICE_ROLE_KEY"  # Get from Supabase Dashboard → Settings → API
CSV_FILE = "villages_without_images.csv"

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def search_google_images(query, max_results=3):
    """Search Google Images and return image URLs"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        search_url = f"https://www.google.com/search?q={query}&tbm=isch"
        response = requests.get(search_url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        images = soup.find_all('img')
        
        urls = []
        for img in images[1:max_results+1]:  # Skip first (Google logo)
            src = img.get('src') or img.get('data-src')
            if src and src.startswith('http'):
                urls.append(src)
        
        return urls
        
    except Exception as e:
        print(f"Error searching images: {e}")
        return []

def download_and_upload_image(image_url, village_id, index):
    """Download image and upload to Supabase Storage"""
    try:
        # Download image
        response = requests.get(image_url, timeout=10)
        if response.status_code != 200:
            return None
        
        # Convert to PIL Image
        img = Image.open(BytesIO(response.content))
        
        # Convert to RGB if needed
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')
        
        # Resize if too large (max 1200x800)
        if img.width > 1200 or img.height > 800:
            img.thumbnail((1200, 800), Image.Resampling.LANCZOS)
        
        # Save to BytesIO
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=85)
        buffer.seek(0)
        
        # Upload to Supabase Storage
        file_path = f"{village_id}/{int(time.time())}_{index}.jpg"
        
        result = supabase.storage.from_('village-images').upload(
            file_path,
            buffer.read(),
            file_options={"content-type": "image/jpeg"}
        )
        
        # Get public URL
        public_url = supabase.storage.from_('village-images').get_public_url(file_path)
        
        return public_url
        
    except Exception as e:
        print(f"Error uploading image: {e}")
        return None

def update_village_images(village_id, image_urls):
    """Update village images in database"""
    try:
        # Get existing images
        result = supabase.table('retirement_villages').select('images').eq('id', village_id).execute()
        
        if not result.data:
            return False
        
        existing_images = result.data[0].get('images', []) or []
        
        # Merge with new images (avoid duplicates)
        all_images = list(set(existing_images + image_urls))
        
        # Update database
        supabase.table('retirement_villages').update({
            'images': all_images
        }).eq('id', village_id).execute()
        
        return True
        
    except Exception as e:
        print(f"Error updating database: {e}")
        return False

# Main scraping loop
df = pd.read_csv(CSV_FILE)
print(f"Found {len(df)} villages to process\\n")

success_count = 0
fail_count = 0

for index, row in df.iterrows():
    village_id = row['id']
    name = row['name']
    suburb = row['suburb']
    state = row['state']
    
    print(f"[{index+1}/{len(df)}] Processing: {name}, {suburb}, {state}")
    
    # Search Google Images
    query = f"retirement village {name} {suburb} {state} australia"
    image_urls = search_google_images(query, max_results=3)
    
    if not image_urls:
        print(f"  ❌ No images found")
        fail_count += 1
        time.sleep(2)
        continue
    
    print(f"  📷 Found {len(image_urls)} images")
    
    # Download and upload images
    uploaded_urls = []
    for i, img_url in enumerate(image_urls):
        print(f"    Uploading image {i+1}...", end=' ')
        public_url = download_and_upload_image(img_url, village_id, i)
        
        if public_url:
            uploaded_urls.append(public_url)
            print("✅")
        else:
            print("❌")
    
    if uploaded_urls:
        # Update database
        if update_village_images(village_id, uploaded_urls):
            print(f"  ✅ Updated village with {len(uploaded_urls)} images")
            success_count += 1
        else:
            print(f"  ❌ Failed to update database")
            fail_count += 1
    else:
        print(f"  ❌ No images uploaded")
        fail_count += 1
    
    # Rate limiting
    time.sleep(3)
    
    # Progress update every 10 villages
    if (index + 1) % 10 == 0:
        print(f"\\n--- Progress: {success_count} success, {fail_count} failed ---\\n")

print(f"\\n{'='*50}")
print(f"COMPLETE!")
print(f"Success: {success_count}")
print(f"Failed: {fail_count}")
print(f"Success Rate: {(success_count / len(df) * 100):.1f}%")
print(f"{'='*50}")`}
            </pre>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm mb-2">⚠️ Important Notes:</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Replace <code className="bg-white px-1 rounded">YOUR_SERVICE_ROLE_KEY</code> with your actual Supabase Service Role Key</li>
              <li>Get the key from: <strong>Supabase Dashboard → Settings → API → Service Role Key</strong></li>
              <li>This script downloads images and uploads them to YOUR storage (reliable!)</li>
              <li>Processing ~763 villages will take 30-45 minutes (rate limiting)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
