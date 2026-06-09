// ============================================
// SPICE & EMBER - VERIFY RAZORPAY PAYMENT
// Supabase Edge Function
// ============================================
// Accepts: POST { razorpay_payment_id, razorpay_order_id, razorpay_signature }
// Verifies HMAC-SHA256 signature, saves to payments table

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface VerifyRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  amount?: number;
  user_id?: string;
}

serve(async (req: Request) => {
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
    if (!RAZORPAY_KEY_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers }
      );
    }

    // --- Parse request body ---
    let body: VerifyRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers }
      );
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: razorpay_payment_id, razorpay_order_id, razorpay_signature",
        }),
        { status: 400, headers }
      );
    }

    // --- Verify HMAC-SHA256 signature ---
    // Signature is generated from: order_id + "|" + payment_id
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(RAZORPAY_KEY_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      new TextEncoder().encode(message)
    );

    const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (generatedSignature !== razorpay_signature) {
      console.error("Invalid payment signature");
      return new Response(
        JSON.stringify({ error: "Invalid payment signature" }),
        { status: 400, headers }
      );
    }

    // --- Signature valid: save to Supabase ---
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { error: insertError } = await supabase
      .from("payments")
      .insert({
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: body.amount || 0,
        status: "captured",
        user_id: body.user_id || null,
      });

    if (insertError) {
      // If duplicate, that's fine — payment already recorded
      if (insertError.code === "23505") {
        console.log("Duplicate payment_id, already recorded:", razorpay_payment_id);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Payment already verified",
            payment_id: razorpay_payment_id,
          }),
          { status: 200, headers }
        );
      }

      console.error("Supabase insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save payment record" }),
        { status: 500, headers }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified successfully",
        payment_id: razorpay_payment_id,
      }),
      { status: 200, headers }
    );
  } catch (err) {
    console.error("Unexpected error in verify-payment:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers }
    );
  }
});