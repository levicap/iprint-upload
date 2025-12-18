"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function CustomerTypePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session_id as string;
  const [isLoading, setIsLoading] = useState(false);

  const handleCustomerType = (type: "new" | "existing") => {
    setIsLoading(true);
    // Store customer type in sessionStorage
    sessionStorage.setItem("customer_type", type);
    sessionStorage.setItem("session_id", sessionId);
    
    // Redirect to upload page
    router.push(`/${sessionId}/upload`);
  };

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
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs">1</span>
              <span>Customer Type</span>
              <div className="w-8 h-px bg-slate-200" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs">2</span>
              <span className="text-slate-400">Upload</span>
              <div className="w-8 h-px bg-slate-200" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs">3</span>
              <span className="text-slate-400">Payment</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-2xl animate-fade-in-up">
          <div className="text-center mb-10 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Welcome to iPrint
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
              Are you a new or existing customer?
            </p>
            {sessionId && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium mt-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"/>
                Session: {sessionId.slice(0, 18)}...
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* New Customer Card */}
            <div 
              className={`bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 transition-all duration-300 ${
                isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-lg hover:border-blue-300"
              }`}
              onClick={isLoading ? undefined : () => handleCustomerType("new")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">New Customer</h2>
                <p className="text-slate-600 mb-4 text-sm">
                  First time ordering with us?
                </p>
                <div className="w-full space-y-2 mb-6">
                  <div className="flex items-center text-xs text-slate-600">
                    <svg className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment required upfront
                  </div>
                  <div className="flex items-center text-xs text-slate-600">
                    <svg className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Instant order processing
                  </div>
                  <div className="flex items-center text-xs text-slate-600">
                    <svg className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Priority production
                  </div>
                </div>
                <button
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    "Continue as New Customer"
                  )}
                </button>
              </div>
            </div>

            {/* Existing Customer Card */}
            <div 
              className={`bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 transition-all duration-300 ${
                isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-lg hover:border-green-300"
              }`}
              onClick={isLoading ? undefined : () => handleCustomerType("existing")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Existing Customer</h2>
                <p className="text-slate-600 mb-4 text-sm">
                  Already ordered with us before?
                </p>
                <div className="w-full space-y-2 mb-6">
                  <div className="flex items-center text-xs text-slate-600">
                    <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Flexible payment options
                  </div>
                  <div className="flex items-center text-xs text-slate-600">
                    <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pay now or later
                  </div>
                  <div className="flex items-center text-xs text-slate-600">
                    <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Account credit available
                  </div>
                </div>
                <button
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    "Continue as Existing Customer"
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Need help? Contact our support team at support@iprint.com
            </p>
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