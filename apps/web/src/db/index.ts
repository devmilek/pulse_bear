import * as schema from "./schema";
import "dotenv/config";

// export const db = drizzle(process.env.DATABASE_URL!, { schema });

import { drizzle } from "drizzle-orm/neon-http";
export const db = drizzle(process.env.DATABASE_URL!, {
  schema,
});
