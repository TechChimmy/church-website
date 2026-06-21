// lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

export async function uploadImage(
  dataUri: string,
  folder = "cft-church"
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return {
    url:      result.secure_url,
    publicId: result.public_id,
    width:    result.width,
    height:   result.height,
    bytes:    result.bytes,
    format:   result.format,
  };
}

export async function deleteImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
