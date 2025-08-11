import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect } from "react";

export const EventsCodeBlock = ({ categoryName }: { categoryName: string }) => {
  const CODE_SNIPPETS = {
    fetch: `await fetch('http://localhost:3000/api/events', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    category: '${categoryName}',
    action: 'Payment successfull', // for example: Payment sucessfull, User registered, etc.
    description: '2x 1TB SSD - Overnight Shipping', // optional: description of the event
    fields: {
      shipping: 'overnight',
      quantity: 2,
      success: true
    } // optional: additional fields
  })
})`,
    sdk: `'use client';

// app/providers.tsx (Next.js) lub src/main.tsx (React)
import { PulseBearProvider } from '@pulsebear/events';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PulseBearProvider
      appKey={process.env.NEXT_PUBLIC_PULSEBEAR_KEY!}
    >
      {children}
    </PulseBearProvider>
  );
}

'use client';

import { usePulseBear } from '@pulsebear/events';

export function CheckoutButton() {
  const { track } = usePulseBear();

  const onPay = async () => {
    await track('${categoryName}', {
      action: 'Payment successful',
      description: '2x 1TB SSD - Overnight Shipping',
      fields: { shipping: 'overnight', quantity: 2, success: true },
    });
  };

  return <button onClick={onPay}>Zapłać</button>;
}`,
  } as const;
  const { resolvedTheme } = useTheme();
  const [variant, setVariant] =
    React.useState<keyof typeof CODE_SNIPPETS>("sdk");
  const [highlightedCode, setHighlightedCode] = React.useState("");

  const filename = variant === "sdk" ? "pulsebear-setup.tsx" : "send-event.ts";
  const lang = variant === "sdk" ? "tsx" : "ts";

  const loadHighlightedCode = useCallback(async () => {
    try {
      const { codeToHtml } = await import("shiki");
      const highlighted = await codeToHtml(CODE_SNIPPETS[variant], {
        lang,
        theme: "material-theme-darker",
      });
      setHighlightedCode(highlighted);
    } catch (e) {
      console.error(`Language "${lang}" could not be loaded.`, e);
    }
  }, [variant, lang, resolvedTheme]);

  useEffect(() => {
    loadHighlightedCode();
  }, [loadHighlightedCode]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted relative flex flex-row items-center justify-between gap-y-2 h-10 px-4">
        <div className="flex flex-row gap-x-2">
          <div className="size-2 rounded-full bg-red-500"></div>
          <div className="size-2 rounded-full bg-yellow-500"></div>
          <div className="size-2 rounded-full bg-green-500"></div>
        </div>
        <div
          className={cn(
            "flex flex-row items-center gap-2",
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          )}
        >
          <div className="text-muted-foreground [&_svg]:size-3.5"></div>
          <figcaption className="flex-1 truncate text-muted-foreground text-[13px]">
            {filename}
          </figcaption>
        </div>

        <Select
          value={variant}
          onValueChange={(v) => setVariant(v as typeof variant)}
        >
          <SelectTrigger className="w-20" size="sm">
            <SelectValue placeholder="Select SDK" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fetch">Fetch</SelectItem>
            <SelectItem value="sdk">SDK</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Wrapper z paddingiem i przewijaniem */}
      <div className="overflow-auto">
        <div
          className="text-sm"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </div>
    </div>
  );
};
