import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useGetOwnerSettings,
  useRemoveOwnerAvatar,
  useUpdateOwnerProfile,
  useUploadOwnerAvatar,
} from "@/api/mutations/useOwnerSettings";
import { fonts } from "@/assets/fonts";
import {
  AppButton,
  AppInput,
  HeaderBar,
  Screen,
  DismissKeyboardScrollView,
} from "@/components/ui/primitives";
import { getApiErrorMessage, showToast } from "@/config/toastConfig";
import { Colors, Radius, Spacing } from "@/constants/theme";

export default function ProfileEditScreen() {
  const { data, isLoading, isError, error, refetch } = useGetOwnerSettings();
  const updateProfile = useUpdateOwnerProfile();
  const uploadAvatar = useUploadOwnerAvatar();
  const removeAvatar = useRemoveOwnerAvatar();

  const profile = data?.profile;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName ?? "");
    setEmail(profile.email ?? "");
    setPhone(profile.phone ?? "");
  }, [profile]);

  const initials = (fullName || "Owner")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function pickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast("error", "Photo library permission is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const fileName =
      asset.fileName ||
      asset.uri.split("/").pop()?.split("?")[0] ||
      `avatar-${Date.now()}.jpg`;
    const mimeType = asset.mimeType || "image/jpeg";

    await uploadAvatar.mutateAsync({
      uri: asset.uri,
      fileName,
      mimeType,
    });
  }

  async function onSave() {
    if (!fullName.trim()) {
      showToast("error", "Full name is required");
      return;
    }
    if (!email.trim()) {
      showToast("error", "Email is required");
      return;
    }
    await updateProfile.mutateAsync({
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
  }

  if (isLoading && !profile) {
    return (
      <Screen>
        <HeaderBar title="Profile" showBack />
        <ActivityIndicator color={Colors.light.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (isError && !profile) {
    return (
      <Screen>
        <HeaderBar title="Profile" showBack />
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Couldn’t load profile</Text>
          <Text style={styles.emptyBody}>
            {getApiErrorMessage(error, "Please try again.")}
          </Text>
          <AppButton label="Retry" onPress={() => refetch()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.pad}>
        <HeaderBar
          title="Profile"
          subtitle="Update your personal details and avatar."
          showBack
        />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <DismissKeyboardScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.avatarRow}>
              {profile?.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
              <View style={styles.avatarActions}>
                <Pressable
                  onPress={() => {
                    void pickAvatar();
                  }}
                  disabled={uploadAvatar.isPending}
                >
                  <Text style={styles.uploadLink}>
                    {uploadAvatar.isPending ? "Uploading…" : "Upload Photo"}
                  </Text>
                </Pressable>
                {profile?.hasAvatar || profile?.avatarUrl ? (
                  <Pressable
                    onPress={() => {
                      void removeAvatar.mutateAsync();
                    }}
                    disabled={removeAvatar.isPending}
                  >
                    <Text style={styles.removeLink}>Remove</Text>
                  </Pressable>
                ) : null}
                <Text style={styles.hint}>JPG or PNG, max 2MB.</Text>
              </View>
            </View>

            <AppInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              autoCapitalize="words"
            />
            <View>
              <AppInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
              <Text style={styles.emailHint}>Changes require verification.</Text>
            </View>
            <AppInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="+971 50 123 4567"
              keyboardType="phone-pad"
            />

            <AppButton
              label="Save Changes"
              loading={updateProfile.isPending}
              onPress={() => {
                void onSave();
              }}
            />
          </View>
        </DismissKeyboardScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: Spacing.four },
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    marginBottom: Spacing.one,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.lightGray,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fonts.inter18.bold,
    fontSize: 22,
    color: Colors.light.white,
  },
  avatarActions: { flex: 1, gap: Spacing.one },
  uploadLink: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 14,
    color: Colors.light.primary,
  },
  removeLink: {
    fontFamily: fonts.inter18.medium,
    fontSize: 14,
    color: Colors.light.black,
  },
  hint: {
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  emailHint: {
    marginTop: 4,
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  empty: {
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.six,
  },
  emptyTitle: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 16,
    color: Colors.light.black,
  },
  emptyBody: {
    fontFamily: fonts.inter18.regular,
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
});
