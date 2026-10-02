import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";
import { getApiErrorMessage, showToast } from "@/config/toastConfig";

export type DocumentCategory =
  | "kyc"
  | "assessment"
  | "contract"
  | "offer_letter"
  | "weekly_report";

export type CreateUploadUrlPayload = {
  project_id: string;
  file_name: string;
  title: string;
  category: DocumentCategory;
  mime_type: string;
};

export type CreateUploadUrlResponse = {
  uploadUrl: string;
  token: string;
  storagePath: string;
  bucket: string;
  category: DocumentCategory;
  title: string;
  fileName: string;
  mimeType: string;
  fileType: string;
  expiresInSeconds: number;
  method: string;
  projectId: string;
  leadId?: string;
};

export type ConfirmUploadPayload = {
  project_id: string;
  storage_path: string;
  file_name: string;
  title: string;
  category: DocumentCategory;
  mime_type: string;
  byte_size: number;
  kyc_item_id?: string;
};

export type UploadOwnerDocumentPayload = {
  projectId: string;
  uri: string;
  fileName: string;
  title: string;
  category: DocumentCategory;
  mimeType: string;
  kycItemId?: string;
};

const createUploadUrl = async (payload: CreateUploadUrlPayload) => {
  const response = await api.post<CreateUploadUrlResponse>(
    "/functions/v1/owner-project-detail",
    {
      action: "create_upload_url",
      ...payload,
    },
  );
  return response.data;
};

const confirmUpload = async (payload: ConfirmUploadPayload) => {
  const response = await api.post("/functions/v1/owner-project-detail", {
    action: "confirm_upload",
    ...payload,
  });
  return response.data;
};

async function putFileToSignedUrl(
  uploadUrl: string,
  uri: string,
  mimeType: string,
): Promise<number> {
  const fileResponse = await fetch(uri);
  const blob = await fileResponse.blob();

  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
      "x-upsert": "false",
    },
    body: blob,
  });

  if (!putResponse.ok) {
    throw new Error(`Upload failed (${putResponse.status})`);
  }

  return blob.size;
}

const uploadOwnerDocument = async (payload: UploadOwnerDocumentPayload) => {
  const signed = await createUploadUrl({
    project_id: payload.projectId,
    file_name: payload.fileName,
    title: payload.title,
    category: payload.category,
    mime_type: payload.mimeType,
  });

  const byteSize = await putFileToSignedUrl(
    signed.uploadUrl,
    payload.uri,
    payload.mimeType || signed.mimeType,
  );

  return confirmUpload({
    project_id: payload.projectId,
    storage_path: signed.storagePath,
    file_name: payload.fileName,
    title: payload.title,
    category: payload.category,
    mime_type: payload.mimeType || signed.mimeType,
    byte_size: byteSize,
    ...(payload.kycItemId ? { kyc_item_id: payload.kycItemId } : {}),
  });
};

export const useUploadOwnerDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadOwnerDocument,
    mutationKey: ["upload-owner-document"],
    onSuccess: async (_data, variables) => {
      showToast("success", "Document uploaded");
      await queryClient.invalidateQueries({
        queryKey: ["owner-project-detail", variables.projectId],
      });
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Document upload failed"),
      );
    },
  });
};
