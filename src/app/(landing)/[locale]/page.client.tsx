// WebVitals.tsx
"use client"; // jeśli używasz Next.js App Router

import { useEffect, useState } from "react";
import { onCLS, onLCP, onTTFB, onINP, onFCP, Metric } from "web-vitals";

type MetricMap = Record<string, Metric>;

export default function WebVitals() {
  const [metrics, setMetrics] = useState<MetricMap>({});

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  useEffect(() => {
    const handleMetric = (metric: Metric) => {
      setMetrics((prev) => ({ ...prev, [metric.name]: metric }));

      console.log(metric, isMobile ? "Mobile" : "Desktop");

      navigator.sendBeacon(
        "/api/vitals",
        JSON.stringify({
          metric_name: metric.name,
          value: metric.value,
          device_type: isMobile ? "phone" : "desktop",
          url: window.location.href,
          api_key: "sk_cme0m3man00005ase2t6ugk0r",
        })
      );
    };

    onCLS(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric);
    onFCP(handleMetric);
  }, []);

  return (
    <div className="p-4 border rounded-md max-w-md mx-auto mt-10">
      <h2 className="text-lg font-semibold mb-4">Web Vitals</h2>
      <ul className="space-y-2">
        {Object.values(metrics).map((metric) => (
          <li key={metric.name}>
            <strong>{metric.name}:</strong> {metric.value.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}
