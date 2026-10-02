import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";
import { getApiErrorMessage, showToast } from "@/config/toastConfig";

export type OwnerSettingsProfile = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: string;
  roleLabel?: string;
  avatarUrl?: string | null;
  hasAvatar?: boolean;
};

export type OwnerSettingsSecurity = {
  passwordChangedAt?: string | null;
  passwordChangedLabel?: string | null;
  lastLoginAt?: string | null;
  lastLoginLabel?: string | null;
  activeDevicesLabel?: string | null;
  activeDevicesCount?: number | null;
};

export type OwnerNotificationPrefs = {
  projectUpdates: boolean;
  milestoneUpdates: boolean;
  documentUpdates: boolean;
  progressReports: boolean;
  communications: boolean;
  accountUpdates: boolean;
};

export type OwnerNotificationItem = {
  key: keyof OwnerNotificationPrefs;
  label: string;
  enabled: boolean;
};

export type OwnerSettingsResponse = {
  profile: OwnerSettingsProfile;
  security: OwnerSettingsSecurity;
  notifications: OwnerNotificationPrefs;
  notificationItems: OwnerNotificationItem[];
  emailVerificationRequired?: boolean;
  message?: string;
};

const SETTINGS_KEY = ["owner-settings"] as const;

const getOwnerSettings = async (): Promise<OwnerSettingsResponse> => {
  const response = await api.get<OwnerSettingsResponse>(
    "/functions/v1/owner-settings",
  );
  return response.data;
};

export const useGetOwnerSettings = () => {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: getOwnerSettings,
  });
};

export type UpdateProfilePayload = {
  full_name: string;
  email: string;
  phone?: string;
};

export type UpdatePasswordPayload = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export type UpdateNotificationsPayload = {
  notifications: Partial<OwnerNotificationPrefs>;
};

const postSettings = async <T = OwnerSettingsResponse>(
  body: Record<string, unknown>,
) => {
  const response = await api.post<T>("/functions/v1/owner-settings", body);
  return response.data;
};

async function putFileToSignedUrl(
  uploadUrl: string,
  uri: string,
  mimeType: string,
): Promise<void> {
  const fileResponse = await fetch(uri);
  const blob = await fileResponse.blob();

  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: blob,
  });

  if (!putResponse.ok) {
    throw new Error(`Avatar upload failed (${putResponse.status})`);
  }
}

export const useUpdateOwnerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      postSettings({ action: "update_profile", ...payload }),
    mutationKey: ["update-owner-profile"],
    onSuccess: async (data) => {
      showToast(
        "success",
        data.message ||
          (data.emailVerificationRequired
            ? "Profile saved — email verification required"
            : "Profile saved"),
      );
      await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Could not save profile"),
      );
    },
  });
};

export const useUpdateOwnerPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePasswordPayload) =>
      postSettings<{
        ok?: boolean;
        passwordChangedAt?: string;
        message?: string;
      }>({ action: "update_password", ...payload }),
    mutationKey: ["update-owner-password"],
    onSuccess: async (data) => {
      showToast("success", data.message || "Password updated");
      await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Could not update password"),
      );
    },
  });
};

export const useLogoutOtherSessions = () => {
  return useMutation({
    mutationFn: () =>
      postSettings<{ ok?: boolean; message?: string }>({
        action: "logout_other_sessions",
      }),
    mutationKey: ["logout-other-sessions"],
    onSuccess: (data) => {
      showToast("success", data.message || "Signed out of all other devices");
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Could not sign out other devices"),
      );
    },
  });
};

export const useUpdateOwnerNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateNotificationsPayload) =>
      postSettings({ action: "update_notifications", ...payload }),
    mutationKey: ["update-owner-notifications"],
    onSuccess: async (data) => {
      showToast("success", data.message || "Notification preferences saved");
      await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Could not save preferences"),
      );
    },
  });
};

export type UploadAvatarPayload = {
  uri: string;
  fileName: string;
  mimeType: string;
};

export const useUploadOwnerAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UploadAvatarPayload) => {
      const signed = await postSettings<{
        uploadUrl: string;
        token: string;
        storagePath: string;
        maxBytes?: number;
        contentTypes?: string[];
      }>({
        action: "create_avatar_upload_url",
        file_name: payload.fileName,
      });

      await putFileToSignedUrl(
        signed.uploadUrl,
        payload.uri,
        payload.mimeType,
      );

      return postSettings({
        action: "confirm_avatar",
        storage_path: signed.storagePath,
      });
    },
    mutationKey: ["upload-owner-avatar"],
    onSuccess: async () => {
      showToast("success", "Avatar updated");
      await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Could not upload avatar"),
      );
    },
  });
};

export const useRemoveOwnerAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => postSettings({ action: "remove_avatar" }),
    mutationKey: ["remove-owner-avatar"],
    onSuccess: async () => {
      showToast("success", "Avatar removed");
      await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Could not remove avatar"),
      );
    },
  });
};
