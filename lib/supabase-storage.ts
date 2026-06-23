// lib/supabase-storage.ts
//
// Drop-in replacement for the old lib/cloudinary.ts. Uploads images to the
// public "cms-images" bucket in Supabase Storage and returns a public URL
// that gets saved on the relevant CMS record (HeroSlide.imageUrl,
// Event.imageUrl, SiteSetting.value, MediaItem.url, etc).

import { randomUUID } from "crypto";
import { supabaseAdmin, CMS_BUCKET } from "./supabase-admin";

export interface UploadResult {
  url: string;      // public URL — store this on the CMS record
  path: string;     // object path inside the bucket — needed to delete later
  size: number;      // bytes
  mimeType: string;
}

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

function parseDataUri(dataUri: string): { mimeType: string; buffer: Buffer } {
  const match = /^data:([^;]+);base64,([\s\S]*)$/.exec(dataUri);
  if (!match) {
    throw new Error("Invalid image data — expected a base64 data URI");
  }
  const [, mimeType, base64] = match;
  return { mimeType, buffer: Buffer.from(base64, "base64") };
}

function sanitizeFolder(folder: string): string {
  return folder.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 60) || "general";
}

/**
 * Uploads a base64 data URI to the cms-images bucket under `<folder>/<uuid>.<ext>`
 * and returns its public URL.
 */
export async function uploadImage(
  dataUri: string,
  folder = "general"
): Promise<UploadResult> {
  const { mimeType, buffer } = parseDataUri(dataUri);

  if (!mimeType.startsWith("image/")) {
    throw new Error("Only image uploads are allowed");
  }

  const ext = EXT_BY_MIME[mimeType] ?? "jpg";
  const safeFolder = sanitizeFolder(folder);
  const path = `${safeFolder}/${randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(CMS_BUCKET)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
      cacheControl: "31536000", // 1 year — filenames are unique, safe to cache hard
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(CMS_BUCKET).getPublicUrl(path);

  return {
    url: data.publicUrl,
    path,
    size: buffer.byteLength,
    mimeType,
  };
}

/** Deletes an object from the cms-images bucket. Safe to call with an empty path. */
export async function deleteImage(path: string): Promise<void> {
  if (!path) return;
  const { error } = await supabaseAdmin.storage.from(CMS_BUCKET).remove([path]);
  if (error) {
    // Don't throw — a failed storage delete shouldn't block deleting the DB row.
    console.error(`Supabase Storage delete failed for "${path}":`, error.message);
  }
}
