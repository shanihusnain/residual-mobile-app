import axios from "axios";

import { ENV } from "@/constants/env";
import {
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/storage/tokenStorage";

type RefreshTokenResponse = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: unknown;
};

/**
 * Refreshes the access token using a bare axios call (not the shared `api`
 * instance) so it never re-enters the 401 interceptor.
 */
export const refreshAccessToken = async (): Promise<string> => {
  const storedRefreshToken = await getRefreshToken();

  if (!storedRefreshToken) {
    throw new Error("No refresh token found");
  }

  if (!ENV.supabaseAnonKey) {
    throw new Error("Missing EXPO_PUBLIC_SUPABASE_ANON_KEY");
  }

  const response = await axios.post<RefreshTokenResponse>(
    `${ENV.supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
    { refresh_token: storedRefreshToken },
    {
      adapter: "fetch",
      headers: {
        apikey: ENV.supabaseAnonKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
  );

  const accessToken = response.data?.access_token;
  const nextRefreshToken = response.data?.refresh_token;

  if (!accessToken) {
    throw new Error("Refresh succeeded but no access token was returned");
  }

  await setAccessToken(accessToken);

  if (nextRefreshToken) {
    await setRefreshToken(nextRefreshToken);
  }

  return accessToken;
};
