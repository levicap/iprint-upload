"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function UploadPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session_id as string;

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      
      // Validate file types
      const validFiles = newFiles.filter(file => {
        const validTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'application/postscript', // AI files
          'image/vnd.adobe.photoshop', // PSD files
          'image/tiff',
          'application/illustrator'
        ];
        return validTypes.includes(file.type) || 
               file.name.match(/\.(pdf|jpg|jpeg|png|ai|psd|tiff|tif|eps)$/i);
      });

      if (validFiles.length !== newFiles.length) {
        setError("Some files were rejected. Only PDF, JPG, PNG, AI, PSD, TIFF, and EPS files are allowed.");
      } else {
        setError("");
      }

      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      setError("");
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setError("");
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result?.toString().split(',')[1];
        if (base64) {
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("Please select at least one file to upload");
      return;
    }

    // Validate file sizes (50MB max per file)
    const oversizedFiles = files.filter(f => f.size > 50 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed 50MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      // Convert files to base64
      setUploadProgress(20);
      const filesData = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          data: await convertFileToBase64(file),
          type: file.type || 'application/octet-stream'
        }))
      );

      setUploadProgress(40);

      // Call n8n webhook
      const response = await fetch('https://auto.moezzhioua.com/webhook/file-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          files: filesData
        })
      });

      setUploadProgress(60);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();

      setUploadProgress(80);

      if (!result.success) {
        throw new Error(result.message || 'Upload failed');
      }

      if (!result.payment_url) {
        throw new Error('Payment URL not received');
      }

      setUploadProgress(100);

      // Success! Redirect to Stripe payment
      setTimeout(() => {
        window.location.href = result.payment_url;
      }, 500);

    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Upload failed. Please try again or contact support.'
      );
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Header with Logo */}
      <header className="border-b border-gray-200 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Image 
              src="/iprintlogo.png" 
              alt="iPrint Logo" 
              width={120} 
              height={40} 
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-semibold">Design Upload Portal</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Upload Your Designs</h1>
            <p className="text-gray-600">Submit multiple design files for printing</p>
            {sessionId && (
              <p className="text-sm text-gray-500 mt-2">
                Order: {sessionId.slice(0, 25)}...
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          {/* Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragging 
                ? "border-black bg-gray-50" 
                : uploading 
                ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 hover:border-gray-500"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={uploading ? undefined : triggerFileInput}
          >
            <div className="flex flex-col items-center justify-center">
              <svg 
                className="w-12 h-12 text-gray-400 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="text-lg mb-2">Drag & drop files here</p>
              <p className="text-gray-500 mb-4">or</p>
              <button 
                type="button"
                disabled={uploading}
                className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Browse Files
              </button>
              <p className="text-gray-500 mt-4 text-sm">Supports PDF, JPG, PNG, AI, PSD, TIFF, EPS (max 50MB per file)</p>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              disabled={uploading}
              accept=".pdf,.jpg,.jpeg,.png,.ai,.psd,.tiff,.tif,.eps"
            />
          </div>

          {/* Upload Progress */}
          {uploading && uploadProgress > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Uploading files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-black h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              {uploadProgress === 100 && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  Redirecting to payment...
                </p>
              )}
            </div>
          )}

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Selected Files ({files.length})</h2>
                <button 
                  type="button"
                  onClick={() => setFiles([])}
                  disabled={uploading}
                  className="text-gray-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {files.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center truncate flex-1">
                      <svg 
                        className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                      <div className="truncate">
                        <span className="truncate text-black block">{file.name}</span>
                        <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                      className="text-gray-400 hover:text-black ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={uploading || files.length === 0}
                className="w-full mt-8 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'Upload Designs & Continue to Payment'
                )}
              </button>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-700">
                    <p className="font-semibold mb-1">🔒 Secure Upload</p>
                    <p>Your files are securely stored in Google Drive and you'll be redirected to complete your payment after uploading.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2025 iPrint Design Upload. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}