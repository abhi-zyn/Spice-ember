// ============================================
// SPICE & EMBER - CREATE RAZORPAY ORDER
// Supabase Edge Function
// ============================================
// Accepts: POST { amount: number (in paise), user_id?: string }
// Returns: { order_id, amount, currency }

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const RAZORPAY_API = "https://api.razorpay.com/v1/orders";

interface CreateOrderRequest {
  amount: number; // in paise (e.g., 50000 = ₹500)
  user_id?: string;
}

interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

serve(async (req: Request) => {
  // --- CORS headers ---
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      { status: 405, headers }
    );
  }

  try {
    // --- Validate environment variables ---
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error("Missing Razorpay environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers }
      );
    }

    // --- Parse and validate request body ---
    let body: CreateOrderRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers }
      );
    }

    if (!body.amount || typeof body.amount !== "number" || body.amount <= 0) {
      return new Response(
        JSON.stringify({ error: "amount is required and must be a positive number (in paise)" }),
        { status: 400, headers }
      );
    }

    // --- Call Razorpay API to create order ---
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

    let razorpayResponse: Response;
    try {
      razorpayResponse = await fetch(RAZORPAY_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: body.amount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            user_id: body.user_id || "guest",
          },
        }),
      });
    } catch (err) {
      console.error("Network error calling Razorpay:", err);
      return new Response(
        JSON.stringify({ error: "Failed to connect to payment gateway" }),
        { status: 502, headers }
      );
    }

    const razorpayData: RazorpayOrderResponse = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error("Razorpay API error:", JSON.stringify(razorpayData));
      return new Response(
        JSON.stringify({
          error: "Payment gateway error",
          details: (razorpayData as unknown as Record<string, string>).error?.description || "Unknown error",
        }),
        { status: razorpayResponse.status, headers }
      );
    }

    // --- Return order details to frontend ---
    return new Response(
      JSON.stringify({
        order_id: razorpayData.id,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
      }),
      { status: 200, headers }
    );
  } catch (err) {
    console.error("Unexpected error in create-order:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers }
    );
  }
});