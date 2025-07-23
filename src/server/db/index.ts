import * as schema from "@/server/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";

export const db = drizzle(process.env.DATABASE_URL!, { schema });
