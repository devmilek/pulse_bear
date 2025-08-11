# @pulsebear/events

Type-safe web events SDK with a tiny React provider and hook.

## Install

This package is part of a monorepo. In your app add the dependency and build the package.

## Usage

```tsx
import { PulseBearProvider, usePulseBear } from "@pulsebear/events";

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PulseBearProvider
      config={{
        apiUrl: "/api/events", // default
        appKey: process.env.NEXT_PUBLIC_PULSEBEAR_KEY,
      }}
    >
      {children}
    </PulseBearProvider>
  );
}

function CheckoutButton() {
  const { track } = usePulseBear();
  return (
    <button
      onClick={() =>
        track("checkout", {
          action: "Payment successful",
          description: "2x 1TB SSD - Overnight Shipping",
          fields: { quantity: 2, shipping: "overnight", success: true },
        })
      }
    >
      Buy
    </button>
  );
}
```

## Strongly typed categories (optional)

```tsx
// categories.ts
export const CATEGORIES = ["auth", "checkout", "bug"] as const;
export type Category = (typeof CATEGORIES)[number];

// app
import type { Category } from "./categories";
import { PulseBearProvider, usePulseBear } from "@pulsebear/events";

function Component() {
  const { track } = usePulseBear<Category>();
  //      ^ track enforces Category union
  // track("unknown" ...) // type error
}
```

## API

- PulseBearProvider: wraps your app; accepts `{ apiUrl?, appKey?, defaultCategory? }`.
- usePulseBear: returns `{ track, config }`.
- track(category, { action, description?, fields? }) → Promise<void>.

## Framework agnostic core

`sendEvent()` in `core` can be used in non-React environments. Future packages can wrap it for Vue/Svelte.

## License

MIT
