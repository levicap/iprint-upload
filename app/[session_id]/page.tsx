"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function CustomerTypePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params.session_id as string;
  
  const [isLoadingNew, setIsLoadingNew] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [hasDesignAttachment, setHasDesignAttachment] = useState<boolean | null>(null);

  useEffect(() => {
    const hasDesign = searchParams.get("hasdesignattachment");
    
    if (hasDesign !== null) {
      const hasDesignValue = hasDesign === "true";
      setHasDesignAttachment(hasDesignValue);
      // ✅ Store in sessionStorage for use across pages
      sessionStorage.setItem("has_design_attachment", hasDesignValue.toString());
      console.log("Stored has_design_attachment:", hasDesignValue);
    } else {
      // Try to get from sessionStorage if not in URL
      const storedValue = sessionStorage.getItem("has_design_attachment");
      if (storedValue !== null) {
        const hasDesignValue = storedValue === "true";
        setHasDesignAttachment(hasDesignValue);
        console.log("Retrieved has_design_attachment from storage:", hasDesignValue);
      } else {
        // Default to false if nothing found (NO files)
        setHasDesignAttachment(false);
        sessionStorage.setItem("has_design_attachment", "false");
      }
    }
  }, [searchParams]);

  const handleCustomerType = async (type: "new" | "existing") => {
    // Set loading state based on customer type
    if (type === "new") {
      setIsLoadingNew(true);
    } else {
      setIsLoadingExisting(true);
    }
    
    sessionStorage.setItem("customer_type", type);
    sessionStorage.setItem("session_id", sessionId);
    
    try {
      // ✅ INVERTED LOGIC:
      // hasDesignAttachment = false → User HAS files (voice agent sent false) → Go to payment
      // hasDesignAttachment = true → User NO files (voice agent sent true) → Go to upload
      
      if (!hasDesignAttachment) {
        // ✅ hasDesignAttachment = FALSE → User HAS design files → Go to payment
        
        if (type === "new") {
          // NEW CUSTOMER with files → Fetch payment URL and redirect to Stripe
          console.log("New customer with files - fetching payment URL...");

          const response = await fetch(`https://iprint.moezzhioua.com/webhook/payment-url?sessionId=${sessionId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();

          if (data && data.url) {
            console.log("Redirecting to Stripe checkout:", data.url);
            // Store payment URL for potential later use
            sessionStorage.setItem("payment_url", data.url);
            window.location.href = data.url;
          } else {
            throw new Error("Payment URL not found in webhook response");
          }
          
        } else {
          // EXISTING CUSTOMER with files → Go to payment options page
          console.log("Existing customer with files - redirecting to payment page...");
          
          // Fetch and store payment URL for the payment page
          try {
            const response = await fetch(`https://iprint.moezzhioua.com/webhook/payment-url?sessionId=${sessionId}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });

            const data = await response.json();
            
            if (data && data.url) {
              sessionStorage.setItem("payment_url", data.url);
              console.log("Payment URL stored:", data.url);
            }
          } catch (error) {
            console.error("Error fetching payment URL:", error);
            // Store fallback URL
            const fallbackUrl = `https://checkout.stripe.com/c/pay/${sessionId}`;
            sessionStorage.setItem("payment_url", fallbackUrl);
          }
          
          // Redirect to payment options page
          router.push(`/${sessionId}/payment`);
        }
        
      } else {
        // ✅ hasDesignAttachment = TRUE → User NO files → Go to upload
        console.log(`${type} customer without files - redirecting to upload page...`);
        router.push(`/${sessionId}/upload`);
      }
      
    } catch (error) {
      console.error("Error handling customer type:", error);
      
      // Fallback behavior
      if (type === "new") {
        // New customer: redirect to Stripe
        const fallbackUrl = `https://checkout.stripe.com/c/pay/${sessionId}`;
        window.location.href = fallbackUrl;
      } else {
        // Existing customer: go to payment page anyway
        router.push(`/${sessionId}/payment`);
      }
    } finally {
      // Reset loading state
      if (type === "new") {
        setIsLoadingNew(false);
      } else {
        setIsLoadingExisting(false);
      }
    }
  };

  if (hasDesignAttachment === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  // Check if any loading is active
  const isAnyLoading = isLoadingNew || isLoadingExisting;

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
          
          {/* Updated Step Indicator - INVERTED LOGIC */}
          <div className="hidden md:flex items-center gap-2 text-sm font-medium">
            {/* Step 1: Customer Type (Current) */}
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs">1</span>
            <span>Customer Type</span>
            <div className="w-8 h-px bg-slate-200" />
            
            {/* Step 2: Upload (Conditional) - INVERTED */}
            {!hasDesignAttachment ? (
              // ✅ hasDesignAttachment = FALSE → Files ARE attached → Skip upload, show payment
              <>
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs">2</span>
                <span className="text-slate-400">Payment</span>
              </>
            ) : (
              // ✅ hasDesignAttachment = TRUE → NO files → Show upload step
              <>
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs">2</span>
                <span className="text-slate-400">Upload</span>
                <div className="w-8 h-px bg-slate-200" />
                
                {/* Step 3: Payment */}
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs">3</span>
                <span className="text-slate-400">Payment</span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Welcome to iPrint</h1>
            <p className="text-lg text-slate-600">Please choose your customer type to proceed.</p>
            {!hasDesignAttachment && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold mt-2">
                Files Detected — Direct Checkout Enabled
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* New Customer Card */}
            <div 
              className={`bg-white rounded-2xl border border-slate-100 p-8 transition-all ${
                isAnyLoading ? "opacity-50" : "cursor-pointer hover:shadow-lg hover:border-blue-300"
              }`}
              onClick={isAnyLoading ? undefined : () => handleCustomerType("new")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 text-blue-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">New Customer</h2>
                <p className="text-sm text-slate-600 mb-4">First time with iPrint</p>
                <button 
                  disabled={isAnyLoading}
                  className="w-full py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingNew ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </div>

            {/* Existing Customer Card */}
            <div 
              className={`bg-white rounded-2xl border border-slate-100 p-8 transition-all ${
                isAnyLoading ? "opacity-50" : "cursor-pointer hover:shadow-lg hover:border-green-300"
              }`}
              onClick={isAnyLoading ? undefined : () => handleCustomerType("existing")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-6 text-green-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">Existing Customer</h2>
                <p className="text-sm text-slate-600 mb-4">Already ordered with us</p>
                <button 
                  disabled={isAnyLoading}
                  className="w-full py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingExisting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Continue"
                  )}
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