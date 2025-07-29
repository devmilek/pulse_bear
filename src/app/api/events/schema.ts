import { CATEGORY_NAME_VALIDATOR } from "@/lib/validators/category-validator";
import z from "zod";

export const REQUEST_VALIDATOR = z
  .object({
    category: CATEGORY_NAME_VALIDATOR,
    action: z.string().min(1, "Action is required."),
    description: z.string().optional(),
    user_id: z.string().optional(),
    fields: z
      .record(z.string(), z.string().or(z.number()).or(z.boolean()))
      .optional(),
  })
  .strict();
