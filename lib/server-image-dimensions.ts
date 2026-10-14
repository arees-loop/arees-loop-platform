import sharp from "sharp";
import type { ImageRequirement } from "./image-requirements";

export async function getServerImageDimensions(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(buffer, { limitInputPixels: 40_000_000 }).metadata();
  if (!metadata.width || !metadata.height) throw new Error("تعذر قراءة أبعاد الصورة.");
  const rotated = metadata.orientation !== undefined && metadata.orientation >= 5 && metadata.orientation <= 8;
  return rotated
    ? { width: metadata.height, height: metadata.width }
    : { width: metadata.width, height: metadata.height };
}

export async function checkServerImageDimensions(file: File, requirement: ImageRequirement) {
  const dimensions = await getServerImageDimensions(file);
  return {
    ...dimensions,
    matches: dimensions.width === requirement.width && dimensions.height === requirement.height,
  };
}
