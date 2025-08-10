import "server-only";

import { headers } from "next/headers";
import { auth } from ".";
import { cache } from "react";

export const getCurrentSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      user: null,
      session: null,
    };
  }

  return {
    user: session.user,
    session: session.session,
  };
});
