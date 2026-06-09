// ============================================
// SPICE & EMBER - RAZORPAY WEBHOOK HANDLER
// Supabase Edge Function
// ============================================
// Listens for Razorpay webhook POST requests
// Verifies X-Razorpay-Signature header
// Handles payment.captured event with idempotency check

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SECRET_KEY = Deno.env.get("SUPABASE_SECRET_KEY")!;

interface WebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        status: string;
        notes?: Record<string, string>;
      };
    };
  };
}

serve(async (req: Request) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Razorpay-Signature",
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
    if (!RAZORPAY_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SECRET_KEY) {
      console.error("Missing required environment variables");
      // Always return 200 to Razorpay to prevent retries
      return new Response(JSON.stringify({ status: "error", message: "Server configuration error" }), {
        status: 200,
        headers,
      });
    }

    // --- Read raw body and signature header ---
    const rawBody = await req.text();
    const razorpaySignature = req.headers.get("X-Razorpay-Signature");

    if (!razorpaySignature) {
      console.error("Missing X-Razorpay-Signature header");
      return new Response(JSON.stringify({ status: "error", message: "Missing signature header" }), {
        status: 200,
        headers,
      });
    }

    // --- Verify webhook signature ---
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(RAZORPAY_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      new TextEncoder().encode(rawBody)
    );

    const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (generatedSignature !== razorpaySignature) {
      console.error("Invalid webhook signature");
      return new Response(JSON.stringify({ status: "error", message: "Invalid webhook signature" }), {
        status: 200,
        headers,
      });
    }

    // --- Parse webhook payload ---
    let payload: WebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      console.error("Invalid webhook JSON body");
      return new Response(JSON.stringify({ status: "error", message: "Invalid JSON" }), {
        status: 200,
        headers,
      });
    }

    // --- Only handle payment.captured event ---
    if (payload.event !== "payment.captured") {
      console.log(`Ignoring event: ${payload.event}`);
      return new Response(JSON.stringify({ status: "ok", message: `Event ${payload.event} ignored` }), {
        status: 200,
        headers,
      });
    }

    const payment = payload.payload?.payment?.entity;
    if (!payment) {
      console.error("No payment entity in webhook payload");
      return new Response(JSON.stringify({ status: "error", message: "Invalid payload structure" }), {
        status: 200,
        headers,
      });
    }

    // --- Initialize Supabase client ---
    const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
      auth: { persistSession: false },
    });

    // --- Idempotency check: does payment already exist? ---
    const { data: existingPayment, error: lookupError } = await supabase
      .from("payments")
      .select("id")
      .eq("payment_id", payment.id)
      .maybeSingle();

    if (lookupError) {
      console.error("Supabase lookup error:", lookupError);
      return new Response(JSON.stringify({ status: "error", message: "Database lookup failed" }), {
        status: 200,
        headers,
      });
    }

    if (existingPayment) {
      console.log(`Payment ${payment.id} already exists — skipping insert`);
      return new Response(JSON.stringify({ status: "ok", message: "Payment already recorded" }), {
        status: 200,
        headers,
      });
    }

    // --- Insert payment record ---
    const { error: insertError } = await supabase
      .from("payments")
      .insert({
        payment_id: payment.id,
        order_id: payment.order_id,
        amount: payment.amount,
        status: payment.status,
        user_id: payment.notes?.user_id || null,
      });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return new Response(JSON.stringify({ status: "error", message: "Failed to save payment" }), {
        status: 200,
        headers,
      });
    }

    console.log(`Payment ${payment.id} recorded successfully via webhook`);
    return new Response(JSON.stringify({ status: "ok", message: "Payment recorded" }), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Unexpected error in razorpay-webhook:", err);
    // Always return 200 to Razorpay to prevent retries
    return new Response(JSON.stringify({ status: "error", message: "Internal server error" }), {
      status: 200,
      headers,
    });
  }
}); }
});