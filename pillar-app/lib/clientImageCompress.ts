const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;

function getDimensions(source: ImageBitmap | HTMLImageElement): { width: number; height: number } {
  if (source instanceof HTMLImageElement) return { width: source.naturalWidth, height: source.naturalHeight };
  return { width: source.width, height: source.height };
}

async function loadImageSource(file: File): Promise<ImageBitmap | HTMLImageElement | null> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // Some browsers can't createImageBitmap from every format — fall back to <img> below.
    }
  }
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve(img); URL.revokeObjectURL(url); };
    img.onerror = () => { resolve(null); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

/**
 * Downscales and re-encodes an image client-side before upload. Phone camera
 * photos routinely come in at 4-12MB, which is large enough to trip request
 * body-size limits on serverless hosting and fail uploads outright. Shrinking
 * to a sane max dimension + JPEG quality here avoids that entirely, and cuts
 * storage/bandwidth cost as a bonus. Falls back to the original file untouched
 * if anything about the compression fails (e.g. an unsupported format).
 */
export async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  try {
    const source = await loadImageSource(file);
    if (!source) return file;

    const { width, height } = getDimensions(source);
    if (!width || !height) return file;

    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(source, 0, 0, targetW, targetH);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

export async function compressImageFiles(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImageFile));
}
