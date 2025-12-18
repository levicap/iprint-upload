"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function CustomerTypePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params.session_id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasDesignAttachment, setHasDesignAttachment] = useState<boolean | null>(null);

  useEffect(() => {
    const hasDesign = searchParams.get("hasdesignattachment");
    if (hasDesign !== null) {
      setHasDesignAttachment(hasDesign === "true");
    } else {
      setHasDesignAttachment(true);
    }
  }, [searchParams]);

  const handleCustomerType = async (type: "new" | "existing") => {
    setIsLoading(true);
    
    sessionStorage.setItem("customer_type", type);
    sessionStorage.setItem("session_id", sessionId);
    
    try {
      if (hasDesignAttachment) {
        /**
         * LOGIC: Fetch payment URL from your custom webhook
         */
        console.log("Fetching payment URL from custom webhook...");

        // Sending the sessionId as a query parameter
        const response = await fetch(`https://iprint.moezzhioua.com/webhook/payment-url?sessionId=${sessionId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        // Redirecting to the URL returned by your webhook
        if (data && data.url) {
          console.log("Redirecting to payment URL:", data.url);
          window.location.href = data.url;
        } else {
          throw new Error("Payment URL not found in webhook response");
        }

      } else {
        // No files attached, go to upload page
        router.push(`/${sessionId}/upload`);
      }
    } catch (error) {
      console.error("Error fetching payment URL:", error);
      // Fallback: Send to standard Stripe checkout if webhook fails
      window.location.href = `https://checkout.stripe.com/c/pay/${sessionId}`;
    } finally {
      setIsLoading(false);
    }
  };

  if (hasDesignAttachment === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans flex flex-col relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-slate-100 to-transparent opacity-70 blur-3xl rounded-full" />
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/iprintlogo.png" alt="iPrint Logo" width={100} height={32} priority />
            <div className="h-6 w-px bg-slate-300 mx-2 hidden sm:block" />
            <span className="text-sm font-medium text-slate-500 hidden sm:block">Secure Upload Portal</span>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-sm font-medium">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs">1</span>
              <span>Account</span>
              <div className="w-8 h-px bg-slate-200" />
              {!hasDesignAttachment && (
                <>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs">2</span>
                  <span className="text-slate-400">Upload</span>
                  <div className="w-8 h-px bg-slate-200" />
                </>
              )}
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs">
                {hasDesignAttachment ? "2" : "3"}
              </span>
              <span className="text-slate-400">Payment</span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Welcome to iPrint</h1>
            <p className="text-lg text-slate-600">Please choose your customer type to proceed.</p>
            {hasDesignAttachment && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold mt-2">
                Files Detected — Direct Checkout Enabled
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className={`bg-white rounded-2xl border border-slate-100 p-8 transition-all ${
                isLoading ? "opacity-50" : "cursor-pointer hover:shadow-lg hover:border-blue-300"
              }`}
              onClick={isLoading ? undefined : () => handleCustomerType("new")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 text-blue-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-4">New Customer</h2>
                <button className="w-full py-3 bg-slate-900 text-white font-medium rounded-xl">
                  {isLoading ? "Loading..." : "Select"}
                </button>
              </div>
            </div>

            <div 
              className={`bg-white rounded-2xl border border-slate-100 p-8 transition-all ${
                isLoading ? "opacity-50" : "cursor-pointer hover:shadow-lg hover:border-green-300"
              }`}
              onClick={isLoading ? undefined : () => handleCustomerType("existing")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-6 text-green-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-4">Existing Customer</h2>
                <button className="w-full py-3 bg-slate-900 text-white font-medium rounded-xl">
                  {isLoading ? "Loading..." : "Select"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-500 py-8 text-center text-sm">
        <p>© 2025 iPrint. All rights reserved.</p>
      </footer>
    </div>
  );
}