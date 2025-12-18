"use client";

import { useState, useRef, ChangeEvent, DragEvent, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function UploadPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session_id as string;

  // Get customer type from sessionStorage
  const [customerType, setCustomerType] = useState<"new" | "existing" | null>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get customer type from sessionStorage
    const type = sessionStorage.getItem("customer_type") as "new" | "existing";
    if (!type) {
      // If no customer type, redirect back to selection
      router.push(`/${sessionId}`);
      return;
    }
    setCustomerType(type);
  }, [sessionId, router]);

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
      const validFiles = newFiles.filter((file) => {
        const validTypes = [
          "application/pdf",
          "image/jpeg",
          "image/jpg",
          "image/png",
          "application/postscript",
          "image/vnd.adobe.photoshop",
          "image/tiff",
          "application/illustrator",
        ];
        return (
          validTypes.includes(file.type) ||
          file.name.match(/\.(pdf|jpg|jpeg|png|ai|psd|tiff|tif|eps)$/i)
        );
      });

      if (validFiles.length !== newFiles.length) {
        setError(
          "Some files were rejected. Only PDF, JPG, PNG, AI, PSD, TIFF, and EPS files are allowed."
        );
      } else {
        setError("");
      }

      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      setError("");
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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
        const base64 = reader.result?.toString().split(",")[1];
        if (base64) {
          resolve(base64);
        } else {
          reject(new Error("Failed to convert file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
  if (files.length === 0) {
    setError("Please select at least one file to upload");
    return;
  }

  // Validate file sizes (50MB max per file)
  const oversizedFiles = files.filter((f) => f.size > 50 * 1024 * 1024);
  if (oversizedFiles.length > 0) {
    setError(
      `Some files exceed 50MB: ${oversizedFiles.map((f) => f.name).join(", ")}`
    );
    return;
  }

  if (!customerType) {
    setError("Customer type not found. Please start over.");
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
        type: file.type || "application/octet-stream",
      }))
    );

    setUploadProgress(40);

    // ⚠️ CHANGED: Use same webhook for both customer types
    const webhookUrl = "https://iprint.moezzhioua.com/webhook/file-upload";

    // Call n8n webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        customer_type: customerType,
        files: filesData,
      }),
    });

    setUploadProgress(60);

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("Upload result:", result);

    setUploadProgress(80);

    if (!result.success) {
      throw new Error(result.message || "Upload failed");
    }

    // ⚠️ CHANGED: Store payment URL in sessionStorage for existing customers
    const paymentUrl = result.payment_url || result.stripe_url;
    
    if (!paymentUrl) {
      console.error("Response data:", result);
      throw new Error("Payment URL not received from server");
    }

    // Store the payment URL for later use
    sessionStorage.setItem("payment_url", paymentUrl);

    setUploadProgress(100);

    // Handle redirect based on customer type
    if (customerType === "new") {
      // New customer: redirect directly to Stripe
      console.log("Redirecting to Stripe:", paymentUrl);
      
      setTimeout(() => {
        window.location.href = paymentUrl;
      }, 500);
    } else {
      // Existing customer: redirect to payment page (payment URL is stored in sessionStorage)
      console.log("Redirecting to payment page with stored URL");
      
      setTimeout(() => {
        router.push(`/${sessionId}/payment`);
      }, 500);
    }
  } catch (err) {
    console.error("Upload error:", err);
    setError(
      err instanceof Error
        ? err.message
        : "Upload failed. Please try again or contact support."
    );
    setUploading(false);
    setUploadProgress(0);
  }
};

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Show loading if customer type not loaded yet
  if (!customerType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans selection:bg-black selection:text-white flex flex-col relative overflow-x-hidden">
      {/* Subtle Background Mesh/Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-slate-100 to-transparent opacity-70 blur-3xl rounded-full" />
      </div>

      {/* Modern Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative transition-transform group-hover:scale-105 duration-300">
              <Image
                src="/iprintlogo.png"
                alt="iPrint Logo"
                width={100}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div className="h-6 w-px bg-slate-300 mx-2 hidden sm:block" />
            <span className="text-sm font-medium text-slate-500 hidden sm:block">
              Secure Upload Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Step Indicator */}
            <div className="hidden md:flex items-center gap-2 text-sm font-medium">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs">1</span>
              <span className="text-slate-400">Customer Type</span>
              <div className="w-8 h-px bg-slate-200" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs">2</span>
              <span>Upload file</span>
              <div className="w-8 h-px bg-slate-200" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs">3</span>
              <span className="text-slate-400">Payment</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-3xl animate-fade-in-up">
          
          <div className="text-center mb-10 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {customerType === "new" ? "Upload Your Files" : "Upload Your Files"}
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
              {customerType === "new" 
                ? "Upload your designs and proceed to secure payment"
                : "Upload your designs and choose your payment option"}
            </p>
            <div className="flex items-center justify-center gap-2">
              {sessionId && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"/>
                  Session: {sessionId.slice(0, 18)}...
                </div>
              )}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                customerType === "new" 
                  ? "bg-blue-50 border border-blue-100 text-blue-600"
                  : "bg-green-50 border border-green-100 text-green-600"
              }`}>
                {customerType === "new" ? "New Customer" : "Existing Customer"}
              </div>
            </div>
          </div>

          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            
            <div className="p-6 sm:p-10">
              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-shake">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              {/* Upload Area */}
              <div
                className={`relative group border-2 border-dashed rounded-2xl p-10 sm:p-16 text-center cursor-pointer transition-all duration-300 ease-out ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/50 scale-[1.01]"
                    : uploading
                    ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-70"
                    : "border-slate-300 hover:border-slate-400 hover:bg-slate-50/30"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={uploading ? undefined : triggerFileInput}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                  disabled={uploading}
                  accept=".pdf,.jpg,.jpeg,.png,.ai,.psd,.tiff,.tif,.eps"
                />

                <div className="flex flex-col items-center justify-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300 ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600 group-hover:scale-110'}`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xl font-semibold text-slate-900">
                      {isDragging ? "Drop files now" : "Click or drag to upload"}
                    </p>
                    <p className="text-sm text-slate-500">
                      PDF, JPG, PNG, AI, PSD, TIFF, EPS (Max 50MB)
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    disabled={uploading}
                    className="mt-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-full shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
                  >
                    Browse Computer
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {uploading && uploadProgress > 0 && (
                <div className="mt-8 space-y-2 animate-fade-in">
                  <div className="flex justify-between text-sm font-medium text-slate-700">
                    <span>
                      {customerType === "new" 
                        ? "Uploading & Processing..." 
                        : "Uploading files..."}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-gray-900 to-black h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  {uploadProgress === 100 && (
                    <p className="text-center text-sm text-green-600 font-medium mt-2 animate-pulse">
                      {customerType === "new"
                        ? "Complete! Redirecting to secure payment..."
                        : "Complete! Redirecting to payment options..."}
                    </p>
                  )}
                </div>
              )}

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-10">
                  <div className="flex justify-between items-end mb-4 border-b border-slate-100 pb-2">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Attached Files <span className="text-slate-400 ml-1 font-normal text-base">({files.length})</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => setFiles([])}
                      disabled={uploading}
                      className="text-sm text-slate-500 hover:text-red-600 transition-colors font-medium"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="group flex items-center p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 mr-4">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{formatFileSize(file.size)}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          disabled={uploading}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:opacity-100"
                          title="Remove file"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={uploading || files.length === 0}
                      className="w-full relative group overflow-hidden bg-slate-900 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                      <span className="relative flex items-center justify-center gap-2">
                        {uploading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            {customerType === "new" 
                              ? "Upload & Proceed to Payment"
                              : "Upload & Continue"}
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Security Footer inside card */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Files are encrypted and stored securely via Google Drive integration.</span>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Dark Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 sm:py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-white text-lg font-bold mb-4">iPrint</h3>
              <p className="text-sm leading-relaxed">
                Premium printing services for professionals. High quality, fast turnaround, and secure handling of your creative assets.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Digital Printing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Large Format</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Corporate Gifts</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">File Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Track Order</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2025 iPrint Design Upload. All rights reserved.</p>
            <div className="flex gap-6">
              <div className="w-5 h-5 bg-slate-800 rounded hover:bg-slate-700 cursor-pointer transition-colors"></div>
              <div className="w-5 h-5 bg-slate-800 rounded hover:bg-slate-700 cursor-pointer transition-colors"></div>
              <div className="w-5 h-5 bg-slate-800 rounded hover:bg-slate-700 cursor-pointer transition-colors"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}