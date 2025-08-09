import z from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .min(3, "Name must be at least 3 characters long"),
  slug: z
    .string()
    .trim()
    .min(3)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        "Slug must be lowercase and can only contain letters, numbers, and hyphens",
    }),
  // domain as ex. example.com without protocol www. or http://
  domain: z
    .string()
    .trim()
    .regex(
      /^(?!https?:\/\/)(?!www\.)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)\.[a-z]{2,}$/,
      { message: "Enter a domain like example.com (without https:// or www)" }
    ),
});
