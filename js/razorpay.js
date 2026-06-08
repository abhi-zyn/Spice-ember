/* ============================================
   SPICE & EMBER - RAZORPAY PAYMENT INTEGRATION
   ============================================ */

const RazorpayPayment = {
  async initiatePayment(orderDetails) {
    return new Promise((resolve, reject) => {
      // Check if Razorpay is loaded
      if (typeof Razorpay === 'undefined') {
        Utils.showToast('Payment system loading...', 'info');
        // Load Razorpay SDK dynamically
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => this.openCheckout(orderDetails, resolve, reject);
        script.onerror = () => {
          // Fallback: complete order without payment
          Utils.showToast('Payment gateway unavailable. Order placed without payment.', 'info');
          resolve({ payment_id: 'offline_' + Utils.generateId(), status: 'pending' });
        };
        document.head.appendChild(script);
        return;
      }

      this.openCheckout(orderDetails, resolve, reject);
    });
  },

  openCheckout(orderDetails, resolve, reject) {
    const amountInPaise = Math.round(orderDetails.total * 100);

    const options = {
      key: CONFIG.razorpayKey,
      amount: amountInPaise,
      currency: 'INR',
      name: CONFIG.appName,
      description: `Order #${orderDetails.orderId}`,
      image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔥</text></svg>',
      prefill: {
        name: orderDetails.customer_name || '',
        email: orderDetails.customer_email || '',
        contact: orderDetails.customer_phone || ''
      },
      theme: {
        color: '#e85d04'
      },
      handler: function (response) {
        resolve({
          payment_id: response.razorpay_payment_id,
          order_id: response.razorpay_order_id,
          signature: response.razorpay_signature,
          status: 'completed'
        });
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment cancelled by user'));
        }
      }
    };

    try {
      const rzp = new Razorpay(options);
      rzp.on('payment.failed', function (response) {
        reject(new Error(response.error.description || 'Payment failed'));
      });
      rzp.open();
    } catch (e) {
      // Fallback if Razorpay fails
      Utils.showToast('Payment gateway unavailable. Order placed without payment.', 'info');
      resolve({ payment_id: 'offline_' + Utils.generateId(), status: 'pending' });
    }
  }
};