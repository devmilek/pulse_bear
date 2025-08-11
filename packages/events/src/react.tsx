"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { BaseEventPayload } from "./types";
import { sendEvent } from "./core";

export type PulseBearConfig = {
  apiUrl?: string; // defaults to 'https://pulsebear.com/api/events'
  apiKey?: string;
  defaultCategory?: string;
};

export type TrackFn<Categories extends string = string> = (
  category: Categories,
  payload: BaseEventPayload
) => Promise<void>;

type Ctx<Categories extends string = string> = {
  track: TrackFn<Categories>;
  config: PulseBearConfig;
};

const PulseBearContext = createContext<Ctx | null>(null);

export type PulseBearProviderProps<Categories extends string = string> =
  React.PropsWithChildren<
    | {
        config: PulseBearConfig;
        apiKey?: never;
        apiUrl?: never;
        defaultCategory?: never;
      }
    | {
        config?: never;
        apiKey?: string;
        apiUrl?: string;
        defaultCategory?: string;
      }
  >;

export function PulseBearProvider<Categories extends string = string>({
  config: cfg,
  apiKey,
  apiUrl,
  defaultCategory,
  children,
}: PulseBearProviderProps<Categories>) {
  const config = useMemo<PulseBearConfig>(
    () =>
      cfg ?? {
        apiKey,
        apiUrl,
        defaultCategory,
      },
    [cfg, apiKey, apiUrl, defaultCategory]
  );
  const track = useCallback<TrackFn<Categories>>(
    async (category, payload) => {
      await sendEvent({
        apiUrl: config.apiUrl, // defaults inside sendEvent
        apiKey: config.apiKey,
        category,
        action: payload.action,
        description: payload.description,
        fields: payload.fields,
      });
    },
    [config.apiUrl, config.apiKey]
  );

  const value = useMemo<Ctx>(() => ({ track, config }), [track, config]);

  return (
    <PulseBearContext.Provider value={value}>
      {children}
    </PulseBearContext.Provider>
  );
}

export function usePulseBear<Categories extends string = string>() {
  const ctx = useContext(PulseBearContext);
  if (!ctx) {
    throw new Error("usePulseBear must be used within a PulseBearProvider");
  }
  return ctx as Ctx<Categories>;
}

// Helper to create a typed tracker with constrained categories
export function createCategoryHelper<const C extends readonly string[]>(
  ...categories: C
) {
  type Categories = C[number];
  return {
    categories,
  } as const;
}
