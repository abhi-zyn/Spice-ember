/* ============================================
   SPICE & EMBER - RAZORPAY PAYMENT INTEGRATION
   Secure flow: Edge Function → Checkout → Verify
   ============================================ */

const RazorpayPayment = {
  /**
   * Step 1: Call Supabase Edge Function to create a Razorpay order
   * Step 2: Open Razorpay checkout with the order_id
   * Step 3: On success, call verify-payment Edge Function
   * Step 4: Return result to caller
   */
  async initiatePayment(orderDetails) {
    const payBtn = document.getElementById("payBtn");

    try {
      // --- Step 1: Create order via Edge Function ---
      if (payBtn) {
        payBtn.disabled = true;
        payBtn.textContent = "Creating order...";
      }

      const amountInPaise = Math.round(orderDetails.total * 100);

      const createOrderResponse = await fetch(
        `${CONFIG.supabaseFunctionUrl}/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amountInPaise,
            user_id: Auth.isLoggedIn ? Auth.currentUser?.id || null : null,
          }),
        }
      );

      if (!createOrderResponse.ok) {
        const errData = await createOrderResponse.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create order");
      }

      const { order_id, amount, currency } = await createOrderResponse.json();

      // --- Step 2: Open Razorpay checkout ---
      if (payBtn) {
        payBtn.textContent = "Opening payment...";
      }

      const paymentResult = await this.openCheckout({
        order_id,
        amount,
        currency,
        orderDetails,
      });

      // --- Step 3: Verify payment signature via Edge Function ---
      if (payBtn) {
        payBtn.textContent = "Verifying payment...";
      }

      const verifyResponse = await fetch(
        `${CONFIG.supabaseFunctionUrl}/verify-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: paymentResult.razorpay_payment_id,
            razorpay_order_id: paymentResult.razorpay_order_id,
            razorpay_signature: paymentResult.razorpay_signature,
            amount: amountInPaise,
            user_id: Auth.isLoggedIn ? Auth.currentUser?.id || null : null,
          }),
        }
      );

      if (!verifyResponse.ok) {
        const errData = await verifyResponse.json().catch(() => ({}));
        throw new Error(errData.error || "Payment verification failed");
      }

      const verifyData = await verifyResponse.json();

      return {
        payment_id: paymentResult.razorpay_payment_id,
        order_id: paymentResult.razorpay_order_id,
        signature: paymentResult.razorpay_signature,
        status: "completed",
        verified: true,
      };
    } catch (err) {
      // Don't throw for user cancellation
      if (err.message === "Payment cancelled by user") {
        throw err;
      }
      console.error("Payment flow error:", err);
      throw err;
    } finally {
      if (payBtn) {
        payBtn.disabled = false;
        payBtn.textContent = "💳 Pay with Razorpay";
      }
    }
  },

  /**
   * Opens the Razorpay checkout modal
   * Returns a promise that resolves with payment data or rejects on failure/cancel
   */
  openCheckout({ order_id, amount, currency, orderDetails }) {
    return new Promise((resolve, reject) => {
      // Load Razorpay SDK if not already loaded
      if (typeof Razorpay === "undefined") {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          this._launchCheckout(
            { order_id, amount, currency, orderDetails },
            resolve,
            reject
          );
        };
        script.onerror = () => {
          reject(new Error("Failed to load payment gateway"));
        };
        document.head.appendChild(script);
        return;
      }

      this._launchCheckout(
        { order_id, amount, currency, orderDetails },
        resolve,
        reject
      );
    });
  },

  _launchCheckout({ order_id, amount, currency, orderDetails }, resolve, reject) {
    const options = {
      key: CONFIG.razorpayKeyId,
      amount: amount,
      currency: currency,
      name: CONFIG.appName,
      description: `Order for ${orderDetails.customer_name || "Guest"}`,
      order_id: order_id,
      image:
        "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23C9A84C' d='M12 2C9 7 6 9.5 6 14a6 6 0 0 0 12 0c0-4.5-3-7-6-12zm0 18a4 4 0 0 1-4-4c0-2.5 1.5-4.3 4-7.5 2.5 3.2 4 5 4 7.5a4 4 0 0 1-4 4z'/></svg>",
      prefill: {
        name: orderDetails.customer_name || "",
        email: orderDetails.customer_email || "",
        contact: orderDetails.customer_phone || "",
      },
      theme: {
        color: "#e85d04",
      },
      handler: function (response) {
        resolve({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: function () {
          reject(new Error("Payment cancelled by user"));
        },
      },
    };

    try {
      const rzp = new Razorpay(options);
      rzp.on("payment.failed", function (response) {
        reject(
          new Error(
            response.error?.description || "Payment failed. Please try again."
          )
        );
      });
      rzp.open();
    } catch (e) {
      reject(new Error("Could not open payment gateway. Please try again."));
    }
  },
};