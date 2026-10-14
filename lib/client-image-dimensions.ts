import type { ImageRequirement } from "./image-requirements";

export type ImageDimensions = { width: number; height: number };

export async function readImageDimensions(file: File): Promise<ImageDimensions> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function matchesImageRequirement(file: File, requirement: ImageRequirement) {
  const dimensions = await readImageDimensions(file);
  return {
    ...dimensions,
    matches: dimensions.width === requirement.width && dimensions.height === requirement.height,
  };
}
