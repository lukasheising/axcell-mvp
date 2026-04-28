"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { supabase } from "../../lib/supabase";

const subscriptionOptions = [
  "One-time",
  "Weekly",
  "Every 2 weeks",
  "Monthly",
] as const;

const fallbackPricing = {
  pricePerWindow: 12,
  interiorPerWindow: 6,
  scrapingPerWindow: 5,
  subscriptionDiscountPercent: 10,
};

type PricingRules = typeof fallbackPricing;

function firstNumber(value: string | undefined) {
  const match = value?.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function getSubscriptionDiscount(frequency: string, rules: PricingRules) {
  if (frequency === "One-time") {
    return 0;
  }

  if (frequency === "Weekly") {
    return Math.max(rules.subscriptionDiscountPercent, 15);
  }

  if (frequency === "Every 2 weeks") {
    return Math.max(rules.subscriptionDiscountPercent, 10);
  }

  return rules.subscriptionDiscountPercent;
}

function formatPrice(value: number) {
  return Math.round(value).toLocaleString("en-US");
}

export default function PriceEstimatorPage() {
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [windowCount, setWindowCount] = useState(20);
  const [insideCleaning, setInsideCleaning] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [subscriptionFrequency, setSubscriptionFrequency] =
    useState<(typeof subscriptionOptions)[number]>("One-time");
  const [notes, setNotes] = useState("");
  const [pricingRules, setPricingRules] =
    useState<PricingRules>(fallbackPricing);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadPricingRules = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return;
      }

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (companyError || !company) {
        return;
      }

      const { data, error } = await supabase
        .from("knowledge_base")
        .select("question, answer")
        .eq("company_id", company.id);

      if (error) {
        return;
      }

      const rulesByQuestion = Object.fromEntries(
        data.map((row) => [row.question, row.answer])
      );

      setPricingRules({
        pricePerWindow:
          firstNumber(rulesByQuestion["Price per window type"]) ??
          fallbackPricing.pricePerWindow,
        interiorPerWindow:
          firstNumber(rulesByQuestion["Interior cleaning pricing"]) ??
          fallbackPricing.interiorPerWindow,
        scrapingPerWindow:
          firstNumber(rulesByQuestion["Scraping surcharge"]) ??
          fallbackPricing.scrapingPerWindow,
        subscriptionDiscountPercent:
          firstNumber(rulesByQuestion["Subscription discount"]) ??
          fallbackPricing.subscriptionDiscountPercent,
      });
    };

    loadPricingRules();
  }, []);

  const estimate = useMemo(() => {
    const basePrice = windowCount * pricingRules.pricePerWindow;
    const interiorPrice = insideCleaning
      ? windowCount * pricingRules.interiorPerWindow
      : 0;
    const scrapingPrice = scraping ? windowCount * pricingRules.scrapingPerWindow : 0;
    const subtotal = basePrice + interiorPrice + scrapingPrice;
    const discountPercent = getSubscriptionDiscount(
      subscriptionFrequency,
      pricingRules
    );
    const discountedTotal = subtotal * (1 - discountPercent / 100);

    return {
      low: discountedTotal * 0.85,
      high: discountedTotal * 1.15,
      discountPercent,
    };
  }, [insideCleaning, pricingRules, scraping, subscriptionFrequency, windowCount]);

  const estimateRange = `DKK ${formatPrice(estimate.low)} - DKK ${formatPrice(
    estimate.high
  )}`;

  const saveEstimate = async () => {
    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);
      alert(userError?.message ?? "You must be logged in to save estimates.");
      return;
    }

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (companyError || !company) {
      setSaving(false);
      alert(companyError?.message ?? "Save company settings before estimates.");
      return;
    }

    const estimateDetails = [
      "Request type: Price request",
      "Urgency: Normal",
      "Phone: Not provided",
      `Address: ${address || "Not provided"}`,
      `Message: Estimate ${estimateRange}; windows: ${windowCount}; inside cleaning: ${
        insideCleaning ? "yes" : "no"
      }; scraping: ${scraping ? "yes" : "no"}; subscription: ${subscriptionFrequency}; discount: ${
        estimate.discountPercent
      }%; notes: ${notes || "No notes provided"}`,
    ].join("\n");

    const { error } = await supabase.from("conversations").insert({
      company_id: company.id,
      customer_name: customerName || null,
      customer_message: estimateDetails,
      ai_response: "Internal price estimate. Range is not a guaranteed quote.",
      status: "open",
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/conversations");
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 max-w-4xl p-10">
        <h1 className="mb-4 text-4xl font-bold">Price Estimator</h1>
        <p className="mb-8 text-gray-400">
          Create a rough window cleaning estimate and save it as a price
          request.
        </p>

        <div className="mb-8 rounded-xl bg-zinc-900 p-6">
          <h2 className="mb-2 text-sm font-medium text-gray-400">
            Estimated price range
          </h2>
          <p className="text-3xl font-semibold">{estimateRange}</p>
        </div>

        <div className="space-y-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">
              Customer name
            </span>
            <input
              className="w-full rounded-xl bg-zinc-900 p-4"
              placeholder="Customer name"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">
              Address
            </span>
            <input
              className="w-full rounded-xl bg-zinc-900 p-4"
              placeholder="Street, city, postal code"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">
              Number of windows
            </span>
            <input
              className="w-full rounded-xl bg-zinc-900 p-4"
              min={1}
              type="number"
              value={windowCount}
              onChange={(event) =>
                setWindowCount(Math.max(1, Number(event.target.value) || 1))
              }
            />
          </label>

          <label className="flex items-center gap-3 rounded-xl bg-zinc-900 p-4">
            <input
              checked={insideCleaning}
              type="checkbox"
              onChange={(event) => setInsideCleaning(event.target.checked)}
            />
            <span>Inside cleaning</span>
          </label>

          <label className="flex items-center gap-3 rounded-xl bg-zinc-900 p-4">
            <input
              checked={scraping}
              type="checkbox"
              onChange={(event) => setScraping(event.target.checked)}
            />
            <span>Scraping needed</span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">
              Subscription frequency
            </span>
            <select
              className="w-full rounded-xl bg-zinc-900 p-4"
              value={subscriptionFrequency}
              onChange={(event) =>
                setSubscriptionFrequency(
                  event.target.value as typeof subscriptionFrequency
                )
              }
            >
              {subscriptionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">
              Notes
            </span>
            <textarea
              className="h-32 w-full rounded-xl bg-zinc-900 p-4"
              placeholder="Access notes, window types, property details"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>

          <button
            className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
            disabled={saving || !customerName}
            onClick={saveEstimate}
          >
            {saving ? "Saving..." : "Save as request"}
          </button>
        </div>
      </div>
    </main>
  );
}
