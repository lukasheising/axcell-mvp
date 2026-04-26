"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../../lib/supabase";

const widgetBaseUrl =
  process.env.NEXT_PUBLIC_WIDGET_URL || "http://localhost:3000";

function createWidgetKey() {
  return `wpk_${crypto.randomUUID().replaceAll("-", "")}`;
}

export default function InstallPage() {
  const [widgetKey, setWidgetKey] = useState("");

  useEffect(() => {
    const loadWidgetKey = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        alert(userError.message);
        return;
      }

      if (!user) {
        return;
      }

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id, widget_public_key")
        .eq("user_id", user.id)
        .maybeSingle();

      if (companyError) {
        alert(companyError.message);
        return;
      }

      if (!company) {
        return;
      }

      if (company.widget_public_key) {
        setWidgetKey(company.widget_public_key);
        return;
      }

      const nextWidgetKey = createWidgetKey();
      const { data, error } = await supabase
        .from("companies")
        .update({ widget_public_key: nextWidgetKey })
        .eq("id", company.id)
        .select("widget_public_key")
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setWidgetKey(data.widget_public_key);
    };

    loadWidgetKey();
  }, []);

  const installSnippet = widgetKey
    ? `<script src="${widgetBaseUrl}/axcell-widget.js" data-widget-key="${widgetKey}"></script>`
    : "Save company settings first, then reload this page.";

  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 p-10 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Install Widget</h1>
        <p className="text-gray-400 mb-8">
          Paste this script before the closing body tag on the page where the
          chat widget should appear.
        </p>

        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-5 text-sm text-gray-100">
          <code>{installSnippet}</code>
        </pre>
      </div>
    </main>
  );
}
