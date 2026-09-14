import { useState, useRef } from 'react';
import * as React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Upload, CheckCircle2, XCircle, Loader2, FolderOpen, FileImage, AlertCircle } from 'lucide-react';

interface UploadResult {
  villageId: string;
  success: boolean;
  url?: string;
  error?: string;
}

export function BulkImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<UploadResult[]>([]);
  const [error, setError] = useState<string>('');
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const [checkingBucket, setCheckingBucket] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check bucket status on mount
  React.useEffect(() => {
    checkBucketStatus();
  }, []);

  const checkBucketStatus = async () => {
    try {
      setCheckingBucket(true);
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
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setBucketExists(data.exists);
      
      if (!data.exists) {
        setError('Storage bucket not initialized. Please go to "Storage Setup" tab and click "Initialize Storage" first.');
      }
    } catch (err: any) {
      console.error('Error checking bucket:', err);
      setError('Failed to check storage status. Please try again.');
    } finally {
      setCheckingBucket(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setError('');
      setResults([]);
      
      // Organize files by village ID
      const filesByVillage = new Map<string, File>();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const pathParts = file.webkitRelativePath.split('/');
        
        // Expecting structure: village_images/village-id/main.jpg
        if (pathParts.length >= 3 && pathParts[2] === 'main.jpg') {
          const villageId = pathParts[1];
          filesByVillage.set(villageId, file);
        }
      }

      const totalFiles = filesByVillage.size;
      setProgress({ current: 0, total: totalFiles });

      console.log(`📦 Found ${totalFiles} villages with images`);

      const uploadResults: UploadResult[] = [];
      let currentIndex = 0;

      // Upload files in batches of 5 to avoid overwhelming the server
      const batchSize = 5;
      const entries = Array.from(filesByVillage.entries());

      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async ([villageId, file]) => {
          try {
            // Read file as base64
            const base64Data = await fileToBase64(file);
            
            // Upload to server
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/storage/upload`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${publicAnonKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  villageId,
                  imageData: base64Data,
                  fileName: 'main.jpg'
                })
              }
            );

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            
            currentIndex++;
            setProgress({ current: currentIndex, total: totalFiles });

            return {
              villageId,
              success: true,
              url: data.url
            };
          } catch (err: any) {
            console.error(`Error uploading ${villageId}:`, err);
            
            currentIndex++;
            setProgress({ current: currentIndex, total: totalFiles });

            return {
              villageId,
              success: false,
              error: err.message
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        uploadResults.push(...batchResults);

        // Update results after each batch
        setResults([...uploadResults]);

        // Small delay between batches
        if (i + batchSize < entries.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      const successCount = uploadResults.filter(r => r.success).length;
      const failCount = uploadResults.filter(r => !r.success).length;

      console.log(`✅ Upload complete: ${successCount} success, ${failCount} failed`);

    } catch (err: any) {
      console.error('Error during bulk upload:', err);
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">📤 Bulk Image Upload</h1>
        <p className="text-muted-foreground">
          Upload the extracted village_images folder to Supabase Storage
        </p>
      </div>

      {/* Upload Card */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <FolderOpen className="size-8 text-blue-600" />
          <div>
            <h2 className="text-2xl">Select Extracted Folder</h2>
            <p className="text-sm text-muted-foreground">
              Choose the village_images folder you extracted from the ZIP
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* File Input */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              /* @ts-ignore */
              webkitdirectory=""
              directory=""
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              size="lg"
              className="w-full"
            >
              {uploading ? (
                <Loader2 className="size-5 mr-2 animate-spin" />
              ) : (
                <Upload className="size-5 mr-2" />
              )}
              {uploading ? 'Uploading...' : 'Select Folder'}
            </Button>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Uploading {progress.current} of {progress.total} images
                </span>
                <span className="font-medium">{progressPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
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

          {/* Results Summary */}
          {results.length > 0 && !uploading && (
            <div className="p-6 rounded-lg bg-gradient-to-br from-green-50 to-blue-50 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="size-8 text-green-600" />
                <div>
                  <h3 className="text-xl">Upload Complete!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your images have been uploaded to Supabase Storage
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl mb-1">{results.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl mb-1 text-green-600">{successCount}</div>
                  <div className="text-xs text-muted-foreground">Success</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl mb-1 text-red-600">{failCount}</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>

              {failCount > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="size-4 text-yellow-700" />
                    <p className="text-sm text-yellow-700">
                      Some uploads failed. Failed villages:
                    </p>
                  </div>
                  <div className="max-h-40 overflow-y-auto text-xs font-mono text-gray-700">
                    {results.filter(r => !r.success).map((r, i) => (
                      <div key={i} className="py-1">
                        {r.villageId}: {r.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Instructions Card */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileImage className="size-6 text-purple-600" />
          <h2 className="text-xl">📋 Upload Instructions</h2>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm mb-2">✅ Before You Upload:</h3>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Extract the <code className="bg-white px-1 rounded">village_images.zip</code> file you downloaded from Google Colab</li>
              <li>Verify the folder structure: <code className="bg-white px-1 rounded">village_images/[village-id]/main.jpg</code></li>
              <li>Click "Select Folder" above and choose the <strong>village_images</strong> folder</li>
              <li>Wait for the upload to complete (takes 5-10 minutes)</li>
            </ol>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm mb-2">🎯 What This Does:</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Uploads images to <strong>Supabase Storage</strong> bucket: <code className="bg-white px-1 rounded">village-images</code></li>
              <li>Organizes images by village ID: <code className="bg-white px-1 rounded">{`{villageId}/main.jpg`}</code></li>
              <li>Processes in <strong>batches of 5</strong> to avoid rate limits</li>
              <li>Shows real-time progress and detailed results</li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-sm mb-2">⏱️ Expected Time:</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li><strong>758 images</strong> × ~0.5 seconds each = <strong>~6-8 minutes</strong></li>
              <li>You can leave this tab open and come back when it's done</li>
              <li>Do not close the browser tab during upload</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}