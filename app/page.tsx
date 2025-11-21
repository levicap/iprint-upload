"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import Image from "next/image";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
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
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      alert("Please select at least one file to upload");
      return;
    }
    
    // Simulate upload process
    alert(`Uploading ${files.length} file(s)...`);
    // In a real app, you would send the files to your backend here
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
          </div>
          
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragging ? "border-black bg-gray-50" : "border-gray-300 hover:border-gray-500"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
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
                className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Browse Files
              </button>
              <p className="text-gray-500 mt-4 text-sm">Supports PDF, JPG, PNG, AI, PSD and more</p>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
            />
          </div>

          {files.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Selected Files ({files.length})</h2>
                <button 
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-gray-500 hover:text-black transition-colors"
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
                    <div className="flex items-center truncate">
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
                      <span className="truncate text-black">{file.name}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-black ml-2"
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
                className="w-full mt-8 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Upload Designs
              </button>
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