const handlePayNow = async () => {
  setIsProcessing(true);
  setError("");

  try {
    // ✅ Calls your n8n webhook
    const response = await fetch(
      "https://iprint.moezzhioua.com/webhook/get-stripe-url",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId, // ✅ Sends the Stripe session ID
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get payment URL: ${response.status}`);
    }

    const result = await response.json();
    // ✅ Expected result: { success: true, stripe_url: "https://checkout.stripe.com/c/pay/cs_..." }

    if (!result.success || !result.stripe_url) {
      throw new Error(result.error || "Payment URL not available");
    }

    // ✅ Redirect to Stripe Checkout
    window.location.href = result.stripe_url;
  } catch (err) {
    console.error("Payment error:", err);
    setError(
      err instanceof Error 
        ? err.message 
        : "Failed to redirect to payment. Please try again."
    );
    setIsProcessing(false);
  }
};