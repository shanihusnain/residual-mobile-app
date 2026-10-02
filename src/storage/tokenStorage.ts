import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const RECOVERY_ACCESS_TOKEN_KEY = "recovery_access_token";
export const USER_DATA_KEY = "user_data";

const isWeb = Platform.OS === "web";

async function getSecureItem(key: string): Promise<string | null> {
  if (isWeb) {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setSecureItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteSecureItem(key: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await getSecureItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to get access token:", error);
    return null;
  }
}

export async function setAccessToken(token: string): Promise<void> {
  const cleanToken = token.replace(/^Bearer\s+/i, "");
  await setSecureItem(ACCESS_TOKEN_KEY, cleanToken);
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await getSecureItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to get refresh token:", error);
    return null;
  }
}

export async function setRefreshToken(token: string): Promise<void> {
  const cleanToken = token.replace(/^Bearer\s+/i, "");
  await setSecureItem(REFRESH_TOKEN_KEY, cleanToken);
}

export async function getRecoveryAccessToken(): Promise<string | null> {
  try {
    return await getSecureItem(RECOVERY_ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setRecoveryAccessToken(token: string): Promise<void> {
  const cleanToken = token.replace(/^Bearer\s+/i, "");
  await setSecureItem(RECOVERY_ACCESS_TOKEN_KEY, cleanToken);
}

export async function clearRecoveryAccessToken(): Promise<void> {
  await deleteSecureItem(RECOVERY_ACCESS_TOKEN_KEY);
}

export async function clearAuthTokens(): Promise<void> {
  await deleteSecureItem(ACCESS_TOKEN_KEY);
  await deleteSecureItem(REFRESH_TOKEN_KEY);
  await deleteSecureItem(RECOVERY_ACCESS_TOKEN_KEY);
}

export async function getUserData(): Promise<string | null> {
  try {
    return await getSecureItem(USER_DATA_KEY);
  } catch {
    return null;
  }
}

export async function setUserData(value: string): Promise<void> {
  await setSecureItem(USER_DATA_KEY, value);
}

export async function clearUserData(): Promise<void> {
  await deleteSecureItem(USER_DATA_KEY);
}
