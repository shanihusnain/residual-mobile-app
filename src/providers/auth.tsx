import {
  createContext,
  use,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import { registerForceSignOut } from "@/api/authSession";
import type { AuthUser } from "@/api/mutations/useLogin";
import { queryClient } from "@/api/queryClient";
import {
  clearAuthTokens,
  clearUserData,
  getAccessToken as getStoredAccessToken,
  getRefreshToken as getStoredRefreshToken,
  getUserData,
  setAccessToken,
  setRefreshToken,
  setUserData,
} from "@/storage/tokenStorage";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Access token when logged in — used by Stack.Protected */
  session: string | null;
  user: AuthUser | null;
  signIn: (
    accessToken: string,
    refreshToken?: string,
    userData?: AuthUser | null,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: AuthUser) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = await getStoredAccessToken();
        const userData = await getUserData();

        if (token) {
          setSession(token);
          setIsAuthenticated(true);
          if (userData) {
            setUser(JSON.parse(userData) as AuthUser);
          }
        }
      } catch (error) {
        console.error("Failed to load auth state", error);
      } finally {
        setIsLoading(false);
      }
    };
    void loadAuthState();
  }, []);

  useEffect(() => {
    registerForceSignOut(async () => {
      await clearAuthTokens();
      await clearUserData();
      queryClient.clear();
      setSession(null);
      setIsAuthenticated(false);
      setUser(null);
    });
  }, []);

  const signIn = async (
    accessToken: string,
    refreshToken?: string,
    userData?: AuthUser | null,
  ) => {
    await setAccessToken(accessToken);
    if (refreshToken) {
      await setRefreshToken(refreshToken);
    }
    if (userData) {
      await setUserData(JSON.stringify(userData));
      setUser(userData);
    }
    setSession(accessToken);
    setIsAuthenticated(true);
  };

  const signOut = async () => {
    await clearAuthTokens();
    await clearUserData();
    queryClient.clear();
    setSession(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = async (userData: AuthUser) => {
    await setUserData(JSON.stringify(userData));
    setUser(userData);
  };

  const getAccessToken = async () => getStoredAccessToken();
  const getRefreshToken = async () => getStoredRefreshToken();

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        session,
        user,
        signIn,
        signOut,
        updateUser,
        getAccessToken,
        getRefreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
