import imageCompression from "browser-image-compression";

export const compressImage = async (file: File): Promise<File> => {
  // Skip already small files
  if (file.size < 300 * 1024) return file;

  const options = {
    maxSizeMB: 0.5, // 500KB (perfect balance)
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Image compression failed:", error);
    return file; // fallback
  }
};
