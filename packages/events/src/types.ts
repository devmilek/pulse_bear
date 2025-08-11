export type Primitive = string | number | boolean | null;

export type BaseEventPayload = {
  action: string;
  description?: string;
  fields?: Record<string, Primitive>;
};
