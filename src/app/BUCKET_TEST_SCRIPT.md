# 🔍 Bucket Diagnostic Script

**Run this FIRST in Google Colab to verify your credentials:**

```python
# Install Supabase
!pip install supabase

from supabase import create_client, Client

# ⚠️ REPLACE THESE WITH YOUR ACTUAL VALUES
SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co"  # Replace YOUR_PROJECT_ID
SUPABASE_KEY = "YOUR_SERVICE_ROLE_KEY_HERE"  # Must be SERVICE ROLE key, NOT anon key

print("🔍 Testing Supabase connection...")
print(f"URL: {SUPABASE_URL}")
print(f"Key: {SUPABASE_KEY[:20]}..." if len(SUPABASE_KEY) > 20 else "Key is too short!")
print()

try:
    # Initialize client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase client created")
    
    # List all buckets
    print("\n📦 Listing all storage buckets...")
    result = supabase.storage.list_buckets()
    
    print(f"\n✅ Found {len(result)} bucket(s):")
    for bucket in result:
        print(f"  - {bucket['name']} (created: {bucket.get('created_at', 'unknown')})")
    
    # Check for village-images bucket specifically
    print("\n🎯 Looking for 'village-images' bucket...")
    village_bucket_exists = any(b['name'] == 'village-images' for b in result)
    
    if village_bucket_exists:
        print("✅ SUCCESS! 'village-images' bucket found!")
        print("\n🎉 Your credentials are correct. You can proceed with scraping.")
    else:
        print("❌ ERROR: 'village-images' bucket NOT found!")
        print("\n📝 Available buckets:", [b['name'] for b in result])
        print("\n💡 Solution: Go to your RetirePath app → Storage Setup tab → Click 'Initialize Storage'")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    print("\n💡 Common issues:")
    print("  1. Wrong SUPABASE_URL - Check your project ID")
    print("  2. Wrong SUPABASE_KEY - Must use SERVICE ROLE key, not anon key")
    print("  3. Bucket not created - Run Storage Setup in your app first")
```

---

## 📋 How to Get Your Credentials:

### 1️⃣ Get Your Project ID:
- Open your RetirePath app
- Look at the browser URL bar
- Your Supabase URL format: `https://YOUR_PROJECT_ID.supabase.co`

### 2️⃣ Get Your Service Role Key:
1. Go to: https://supabase.com/dashboard
2. Select your RetirePath project
3. Click **Settings** (left sidebar, gear icon)
4. Click **API** tab
5. Scroll down to "Project API keys"
6. Find **"service_role"** key (NOT "anon" key!)
7. Click the **eye icon** to reveal it
8. Click **Copy**

⚠️ **CRITICAL:** You MUST use the **service_role** key, NOT the anon key!

---

## 🚀 What to Do:

1. **Run this diagnostic script FIRST** in Google Colab
2. **Replace** `YOUR_PROJECT_ID` and `YOUR_SERVICE_ROLE_KEY_HERE` with your actual values
3. **Check the output:**
   - ✅ If it says "SUCCESS! village-images bucket found" → Proceed with scraping
   - ❌ If it says "Bucket NOT found" → Go back to Storage Setup tab and initialize it
   - ❌ If you get connection errors → Your credentials are wrong

4. **Once you see SUCCESS**, proceed with the full scraping script

---

## 🔐 Security Note:
- Never share your service role key publicly
- Only use it in your private Colab notebook
- It has full admin access to your database
