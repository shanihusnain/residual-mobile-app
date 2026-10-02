import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  NativeModules,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useUploadOwnerDocument,
  type DocumentCategory,
} from "@/api/mutations/useUploadOwnerDocument";
import {
  useGetOwnerProjectDetail,
  type OwnerKycItem,
  type OwnerProjectDocument,
} from "@/api/queries/useGetOwnerProjectDetail";
import { fonts } from "@/assets/fonts";
import { AppButton, StatusPill } from "@/components/ui/primitives";
import { getApiErrorMessage, showToast } from "@/config/toastConfig";
import { Colors, Radius, Spacing } from "@/constants/theme";

type PickedAsset = {
  uri: string;
  name: string;
  mimeType?: string | null;
};

type UploadCategoryOption = {
  id: DocumentCategory;
  label: string;
};

const ALL_UPLOAD_TYPES: UploadCategoryOption[] = [
  { id: "kyc", label: "KYC Documents" },
  { id: "contract", label: "Signed Contracts" },
];

function fileNameFromUri(uri: string, fallback: string) {
  const segment = uri.split("/").pop()?.split("?")[0];
  return segment && segment.includes(".") ? segment : fallback;
}

async function pickWithImageLibrary(): Promise<PickedAsset | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    showToast("error", "Photo library permission is required to upload");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 1,
    allowsMultipleSelection: false,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  const name =
    asset.fileName ||
    fileNameFromUri(asset.uri, `upload-${Date.now()}.jpg`);

  return {
    uri: asset.uri,
    name,
    mimeType: asset.mimeType || "image/jpeg",
  };
}

async function pickDocument(): Promise<PickedAsset | null> {
  if (NativeModules.ExpoDocumentPicker) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const DocumentPicker = require("expo-document-picker") as typeof import("expo-document-picker");
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets?.[0]) return null;
    const file = result.assets[0];
    return {
      uri: file.uri,
      name: file.name,
      mimeType: file.mimeType,
    };
  }

  return pickWithImageLibrary();
}

function statusTone(status: string) {
  const lower = status.toLowerCase();
  if (lower.includes("verif")) return "success" as const;
  if (lower.includes("pend") || lower.includes("upload"))
    return "warning" as const;
  return "neutral" as const;
}

function DocRow({ item }: { item: OwnerProjectDocument }) {
  return (
    <View style={styles.docRow}>
      <View style={styles.docBody}>
        <Text style={styles.docTitle}>{item.title}</Text>
        <Text style={styles.docMeta}>
          {item.fileType} · {item.uploadedBy} · {item.uploadDate}
        </Text>
        <StatusPill label={item.status} tone={statusTone(item.status)} />
      </View>
      {item.downloadUrl ? (
        <Pressable onPress={() => Linking.openURL(item.downloadUrl!)}>
          <Text style={styles.link}>Download</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function SelectChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipActive]}
    >
      {selected ? <Text style={styles.chipCheck}>✓</Text> : null}
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function DocumentsTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetOwnerProjectDetail(id, "documents");
  const { mutateAsync, isPending } = useUploadOwnerDocument();

  const [showUpload, setShowUpload] = useState(false);
  const [category, setCategory] = useState<DocumentCategory>("kyc");
  const [kycItemId, setKycItemId] = useState<string | null>(null);
  const [picked, setPicked] = useState<PickedAsset | null>(null);

  const kycDocuments = data?.kycDocuments ?? [];
  const projectDocuments = data?.projectDocuments ?? [];
  const kycItems = useMemo(() => {
    const items = data?.kycItems ?? [];
    return [...items].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );
  }, [data?.kycItems]);

  const allowedCategories = data?.project?.allowedUploadCategories;
  const uploadTypes = useMemo(() => {
    if (!allowedCategories?.length) return ALL_UPLOAD_TYPES;
    return ALL_UPLOAD_TYPES.filter((item) =>
      allowedCategories.includes(item.id),
    );
  }, [allowedCategories]);

  useEffect(() => {
    if (!uploadTypes.length) return;
    if (!uploadTypes.some((item) => item.id === category)) {
      setCategory(uploadTypes[0].id);
    }
  }, [uploadTypes, category]);

  useEffect(() => {
    if (category !== "kyc") {
      setKycItemId(null);
      return;
    }
    if (!kycItems.length) {
      setKycItemId(null);
      return;
    }
    const stillValid = kycItems.some((item) => item.id === kycItemId);
    if (!stillValid) {
      const firstOpen =
        kycItems.find((item) => !item.document_id) ?? kycItems[0];
      setKycItemId(firstOpen.id);
    }
  }, [category, kycItems, kycItemId]);

  function openUploadModal() {
    setPicked(null);
    setShowUpload(true);
  }

  function closeUploadModal() {
    if (isPending) return;
    setShowUpload(false);
    setPicked(null);
  }

  async function onChooseFile() {
    const file = await pickDocument();
    if (!file) return;
    setPicked(file);
  }

  async function onUpload() {
    if (!id) return;
    if (!picked) {
      showToast("error", "Choose a file to upload");
      return;
    }
    if (category === "kyc" && !kycItemId) {
      showToast("error", "Select a KYC checklist item");
      return;
    }

    const selectedKyc: OwnerKycItem | undefined =
      category === "kyc"
        ? kycItems.find((item) => item.id === kycItemId)
        : undefined;

    const title =
      selectedKyc?.title ||
      picked.name.replace(/\.[^.]+$/, "") ||
      picked.name;

    await mutateAsync({
      projectId: id,
      uri: picked.uri,
      fileName: picked.name,
      title,
      category,
      mimeType: picked.mimeType || "application/octet-stream",
      kycItemId: selectedKyc?.id,
    });

    setShowUpload(false);
    setPicked(null);
  }

  if (isLoading && !data) {
    return (
      <ActivityIndicator color={Colors.light.primary} style={styles.loader} />
    );
  }

  if (isError) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Couldn’t load documents</Text>
        <Text style={styles.emptyBody}>
          {getApiErrorMessage(error, "Please try again.")}
        </Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.retry}>Tap to retry</Text>
        </Pressable>
      </View>
    );
  }

  const canUpload = uploadTypes.length > 0;

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.pad}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {canUpload ? (
          <AppButton label="Upload Document" onPress={openUploadModal} />
        ) : (
          <Text style={styles.emptyBody}>
            Uploads are not available for this project right now.
          </Text>
        )}

        <Text style={[styles.heading, { marginTop: Spacing.four }]}>
          KYC Documents
        </Text>
        {kycDocuments.length === 0 ? (
          <Text style={styles.emptyBody}>No KYC documents yet.</Text>
        ) : (
          kycDocuments.map((doc) => <DocRow key={doc.id} item={doc} />)
        )}

        <Text style={[styles.heading, { marginTop: Spacing.four }]}>
          Project Documents
        </Text>
        {projectDocuments.length === 0 ? (
          <Text style={styles.emptyBody}>No project documents yet.</Text>
        ) : (
          projectDocuments.map((doc) => <DocRow key={doc.id} item={doc} />)
        )}
      </ScrollView>

      <Modal
        visible={showUpload}
        transparent
        animationType="fade"
        onRequestClose={closeUploadModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Document</Text>
              <Pressable onPress={closeUploadModal} hitSlop={12}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              <Text style={styles.sectionLabel}>Document Type</Text>
              <View style={styles.chips}>
                {uploadTypes.map((item) => (
                  <SelectChip
                    key={item.id}
                    label={item.label}
                    selected={category === item.id}
                    onPress={() => setCategory(item.id)}
                  />
                ))}
              </View>

              {category === "kyc" ? (
                <>
                  <Text style={styles.sectionLabel}>KYC Checklist Item</Text>
                  {kycItems.length === 0 ? (
                    <Text style={styles.emptyBody}>
                      No KYC checklist items available.
                    </Text>
                  ) : (
                    <View style={styles.chips}>
                      {kycItems.map((item) => (
                        <SelectChip
                          key={item.id}
                          label={item.title}
                          selected={kycItemId === item.id}
                          onPress={() => setKycItemId(item.id)}
                        />
                      ))}
                    </View>
                  )}
                </>
              ) : null}

              <Text style={styles.sectionLabel}>File</Text>
              <Pressable
                style={styles.fileBox}
                onPress={() => void onChooseFile()}
              >
                <Text style={styles.fileIcon}>↑</Text>
                <Text style={styles.fileLabel}>
                  {picked ? picked.name : "Choose a file"}
                </Text>
              </Pressable>
            </ScrollView>

            <View style={styles.modalActions}>
              <AppButton
                label="Cancel"
                variant="outline"
                onPress={closeUploadModal}
              />
              <AppButton
                label="Upload"
                loading={isPending}
                onPress={() => {
                  void onUpload().catch(() => {
                    // Toast handled in mutation
                  });
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pad: { padding: Spacing.four, gap: Spacing.two, paddingBottom: Spacing.six },
  loader: { marginTop: Spacing.six },
  heading: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 16,
    color: Colors.light.black,
  },
  sectionLabel: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 14,
    color: Colors.light.black,
    marginTop: Spacing.two,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.light.black,
    backgroundColor: Colors.light.white,
  },
  chipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipCheck: {
    fontFamily: fonts.inter18.bold,
    fontSize: 12,
    color: Colors.light.white,
  },
  chipText: {
    fontFamily: fonts.inter18.medium,
    fontSize: 13,
    color: Colors.light.black,
  },
  chipTextActive: { color: Colors.light.white },
  fileBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Colors.light.border,
    borderRadius: Radius.lg,
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    backgroundColor: Colors.light.lightGray,
  },
  fileIcon: {
    fontSize: 22,
    color: Colors.light.textSecondary,
  },
  fileLabel: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    paddingHorizontal: Spacing.three,
  },
  docRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  docBody: { flex: 1, gap: Spacing.one },
  docTitle: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 15,
    color: Colors.light.black,
  },
  docMeta: {
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  link: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 13,
    color: Colors.light.primary,
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
  },
  retry: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 14,
    color: Colors.light.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: Spacing.four,
  },
  modalCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
    maxHeight: "90%",
  },
  modalScroll: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontFamily: fonts.inter18.bold,
    fontSize: 20,
    color: Colors.light.black,
  },
  modalClose: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    paddingHorizontal: Spacing.one,
  },
  modalActions: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
