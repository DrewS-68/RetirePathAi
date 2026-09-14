import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Image, CheckCircle2, AlertCircle } from 'lucide-react';

interface Village {
  id: string;
  name: string;
  suburb: string;
  state: string;
  images?: string[];
}

export function TestImageUpload() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<string>('');
  const [imageUrls, setImageUrls] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVillages();
  }, []);

  const fetchVillages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/search`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch villages');
      }

      const data = await response.json();
      setVillages(data.villages || []);
    } catch (err: any) {
      console.error('Error fetching villages:', err);
      setError('Failed to load villages');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      // Filter out empty image URLs
      const filteredImages = imageUrls.filter(url => url.trim() !== '');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/${selectedVillage}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            images: filteredImages,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update village');
      }

      setSuccess(true);
      setImageUrls(['', '', '', '']);
      setSelectedVillage('');
      
      // Refresh villages list
      await fetchVillages();
    } catch (err: any) {
      console.error('Error updating village:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sample retirement village images from Unsplash
  const sampleImages = [
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop',
  ];

  const useSampleImages = () => {
    setImageUrls(sampleImages);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl mb-2">🧪 Test Image Upload</h1>
          <p className="text-muted-foreground">
            Add test images to villages to see how they display in cards and profiles
          </p>
        </div>

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="size-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Images successfully added to village! Check the Village Directory to see the results.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Village Selection */}
            <div>
              <Label htmlFor="village">Select Village *</Label>
              <select
                id="village"
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                required
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Choose a village --</option>
                {villages.map((village) => (
                  <option key={village.id} value={village.id}>
                    {village.name} ({village.suburb}, {village.state})
                    {village.images && village.images.length > 0 ? ' ✓ Has images' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Sample Button */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={useSampleImages}
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                <Image className="size-4 mr-2" />
                Use Sample Images
              </Button>
              <span className="text-sm text-muted-foreground">
                (Fills in high-quality placeholder images)
              </span>
            </div>

            {/* Image URL Inputs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image className="size-5 text-purple-600" />
                <h3 className="font-medium">Image URLs</h3>
              </div>

              {imageUrls.map((url, index) => (
                <div key={index}>
                  <Label htmlFor={`image-${index}`}>
                    Image {index + 1} {index === 0 && '(Primary - shown on cards)'}
                  </Label>
                  <Input
                    id={`image-${index}`}
                    type="url"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...imageUrls];
                      newUrls[index] = e.target.value;
                      setImageUrls(newUrls);
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                  {url && (
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.alt = 'Failed to load image';
                          e.currentTarget.className = 'w-full h-48 flex items-center justify-center bg-red-50 text-red-500 text-sm';
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sample URLs Info */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm text-blue-800">
                <strong>Tip:</strong> You can use images from Unsplash or any direct image URL. 
                Right-click on any image online and select "Copy Image Address" to get the URL.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !selectedVillage}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {loading ? 'Adding Images...' : 'Add Images to Village'}
            </Button>
          </form>
        </Card>

        {/* Instructions */}
        <Card className="mt-6 p-6 bg-gray-50">
          <h3 className="font-medium mb-3">📋 Testing Instructions:</h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Select a village from the dropdown</li>
            <li>Click "Use Sample Images" to auto-fill with test images, or paste your own URLs</li>
            <li>Click "Add Images to Village"</li>
            <li>Navigate to the Village Directory to see the village card with the image</li>
            <li>Click on the village to see the full profile with image gallery</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
