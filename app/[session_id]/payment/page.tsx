"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params.session_id as string;
  
  const [customerType, setCustomerType] = useState<"new" | "existing" | null>(null);
  const [isProcessingPayNow, setIsProcessingPayNow] = useState(false);
  const [isProcessingPayLater, setIsProcessingPayLater] = useState(false);
  const [error, setError] = useState("");
  const [showPayLaterForm, setShowPayLaterForm] = useState(false);
  const [payLaterSuccess, setPayLaterSuccess] = useState(false);
  const [storedPaymentUrl, setStoredPaymentUrl] = useState<string | null>(null);
  const [hasDesignAttachment, setHasDesignAttachment] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    // Get customer type from sessionStorage
    const type = sessionStorage.getItem("customer_type") as "new" | "existing";
    if (!type) {
      // If no customer type, redirect back to start
      router.push(`/${sessionId}`);
      return;
    }
    setCustomerType(type);

    // Get stored payment URL from sessionStorage
    const paymentUrl = sessionStorage.getItem("payment_url");
    if (paymentUrl) {
      setStoredPaymentUrl(paymentUrl);
      console.log("Retrieved stored payment URL:", paymentUrl);
    } else {
      console.warn("No payment URL found in sessionStorage");
    }

    // ✅ Get hasDesignAttachment from sessionStorage
    const storedHasDesign = sessionStorage.getItem("has_design_attachment");
    if (storedHasDesign !== null) {
      setHasDesignAttachment(storedHasDesign === "true");
      console.log("Retrieved has_design_attachment from storage:", storedHasDesign);
    } else {
      // Fallback to URL if not in storage
      const hasDesign = searchParams.get("hasdesignattachment");
      if (hasDesign !== null) {
        const hasDesignValue = hasDesign === "true";
        setHasDesignAttachment(hasDesignValue);
        // Store it for future use
        sessionStorage.setItem("has_design_attachment", hasDesignValue.toString());
      }
    }
  }, [sessionId, router, searchParams]);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
  };

  const handlePayNow = async () => {
    setIsProcessingPayNow(true);
    setError("");

    try {
      // Use stored payment URL instead of calling webhook
      if (storedPaymentUrl) {
        console.log("Using stored payment URL:", storedPaymentUrl);
        // Redirect to Stripe using the stored URL
        window.location.href = storedPaymentUrl;
        return;
      }

      // Fallback: If no stored URL, construct from session_id
      console.log("No stored URL, constructing from session_id...");
      const fallbackUrl = `https://checkout.stripe.com/c/pay/${sessionId}`;
      window.location.href = fallbackUrl;
      
    } catch (err) {
      console.error("Payment error:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Failed to redirect to payment. Please try again."
      );
      setIsProcessingPayNow(false);
    }
  };

  const handlePayLater = async () => {
    // Validate customer info
    if (!customerInfo.name || !customerInfo.email) {
      showToast("error", "Please provide your name and email");
      return;
    }

    setIsProcessingPayLater(true);

    try {
      const response = await fetch(
        "https://iprint.moezzhioua.com/webhook/existing-customer-pay-later",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            customer_name: customerInfo.name,
            customer_email: customerInfo.email,
            customer_phone: customerInfo.phone,
            payment_status: "pending",
          }),
        }
      );

      console.log("Pay later response status:", response.status);

      const result = await response.json();
      console.log("Pay later result:", result);

      // ✅ Check if the response indicates success or failure
      if (result.success) {
        // SUCCESS - Show green toast
        showToast("success", "Order created successfully! We'll send an invoice to your email.");
        setPayLaterSuccess(true);
        setShowPayLaterForm(false);
      } else {
        // ERROR - Show red toast (email not found or other error)
        if (result.error === "Email not found") {
          showToast("error", "Email not found. Please check your email address or contact support.");
        } else {
          showToast("error", result.message || "Failed to save order. Please try again.");
        }
      }

      setIsProcessingPayLater(false);
      
    } catch (err) {
      console.error("Pay later error:", err);
      showToast("error", "Failed to save order. Please try again.");
      setIsProcessingPayLater(false);
    }
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
              Secure Payment Portal
            </span>
          </div>

          {/* Updated Step Indicator - Based on sessionStorage */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium">
              {/* Step 1: Customer Type (always shown, completed) */}
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs">1</span>
              <span className="text-slate-400">Customer Type</span>
              <div className="w-8 h-px bg-slate-200" />
              
              {hasDesignAttachment ? (
                // ✅ FILES ATTACHED: Customer Type → Payment (2 steps)
                <>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs">2</span>
                  <span>Payment</span>
                </>
              ) : (
                // ❌ NO FILES: Customer Type → Upload → Payment (3 steps)
                <>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs">2</span>
                  <span className="text-slate-400">Upload</span>
                  <div className="w-8 h-px bg-slate-200" />
                  
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs">3</span>
                  <span>Payment</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Toast Notification - Bottom Right */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md animate-fade-in">
          <div className={`rounded-lg p-4 shadow-lg ${
            toast.type === "success" 
              ? "bg-green-50 border border-green-200" 
              : "bg-red-50 border border-red-200"
          }`}>
            <div className="flex items-start gap-3">
              {toast.type === "success" ? (
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  toast.type === "success" ? "text-green-800" : "text-red-800"
                }`}>
                  {toast.message}
                </p>
                <button
                  onClick={() => setToast(null)}
                  className={`mt-2 text-xs font-medium ${
                    toast.type === "success" 
                      ? "text-green-600 hover:text-green-700" 
                      : "text-red-600 hover:text-red-700"
                  }`}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert (Top Right - Keep for compatibility) */}
      {error && (
        <div className="fixed top-20 right-4 z-50 max-w-md animate-fade-in">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
                <button
                  onClick={() => setError("")}
                  className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-3xl animate-fade-in-up">
          <div className="text-center mb-10 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Complete Your Order
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
              {hasDesignAttachment 
                ? "Your order is ready. Please select a payment option to proceed."
                : "Your files have been uploaded successfully. Please select a payment option to proceed."}
            </p>
            <div className="flex items-center justify-center gap-2">
              {sessionId && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"/>
                  Session: {sessionId.slice(0, 18)}...
                </div>
              )}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-600 text-xs font-medium">
                Existing Customer
              </div>
            </div>
          </div>

          {/* Payment Options Card */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="p-6 sm:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pay Now Option */}
                <div className="border border-slate-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                  <div className="flex items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">Pay Now</h3>
                      <p className="text-slate-600 text-sm">Complete payment immediately</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-slate-600">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Instant order processing
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Priority production queue
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Faster delivery time
                    </li>
                  </ul>
                  <button
                    onClick={handlePayNow}
                    disabled={isProcessingPayNow}
                    className="w-full py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessingPayNow ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Proceed to Payment"
                    )}
                  </button>
                </div>

                {/* Pay Later Option */}
                <div className="border border-slate-200 rounded-xl p-6 hover:border-green-300 transition-colors">
                  <div className="flex items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">Pay Later</h3>
                      <p className="text-slate-600 text-sm">Pay via invoice or account credit</p>
                    </div>
                  </div>
                  
                  {payLaterSuccess ? (
                    // Success Message
                    <div className="text-center py-4">
                      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-lg text-slate-900 mb-2">Order Saved!</h4>
                      <p className="text-sm text-slate-600">
                        We'll send an invoice to<br/>
                        <span className="font-medium text-slate-900">{customerInfo.email}</span>
                      </p>
                    </div>
                  ) : !showPayLaterForm ? (
                    <>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center text-sm text-slate-600">
                          <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Order saved for 30 days
                        </li>
                        <li className="flex items-center text-sm text-slate-600">
                          <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Invoice sent to email
                        </li>
                        <li className="flex items-center text-sm text-slate-600">
                          <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Use account credit
                        </li>
                      </ul>
                      <button
                        onClick={() => setShowPayLaterForm(true)}
                        disabled={isProcessingPayLater}
                        className="w-full py-3 bg-white border border-slate-300 text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                      >
                        Choose Pay Later
                      </button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                          placeholder="John Doe"
                          disabled={isProcessingPayLater}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                          placeholder="john@example.com"
                          disabled={isProcessingPayLater}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                          placeholder="+1 (555) 000-0000"
                          disabled={isProcessingPayLater}
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setShowPayLaterForm(false)}
                          disabled={isProcessingPayLater}
                          className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                          Back
                        </button>
                        <button
                          onClick={handlePayLater}
                          disabled={isProcessingPayLater}
                          className="flex-1 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {isProcessingPayLater ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Saving...
                            </span>
                          ) : (
                            "Confirm"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-slate-600 text-sm">
                  Need help? Contact our support team at support@iprint.com
                </p>
              </div>
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