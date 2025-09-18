"use server";

import sharp from "sharp";
import exifr from "exifr";

// Process single image with optimization
export const processImageToBase64 = async (url: string): Promise<{ base64: string; metadata: any }> => {
  try {
    // Fetch image with proper error handling
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Read the image data as an ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      throw new Error("Received empty array buffer");
    }

    // Convert arrayBuffer to Buffer (sharp expects a Buffer, not ArrayBuffer)
    const buffer = Buffer.from(arrayBuffer);

    let optimizedBuffer: Buffer = new Buffer(buffer.byteLength);
    let metadata: any;

    try {
      // Try to process the image with sharp
      const sharpInstance = sharp(buffer).resize(
        500, // maximum width
        500, // maximum height
        {
          fit: "inside", // ensure it fits within the specified dimensions while maintaining the aspect ratio
          withoutEnlargement: true // don't enlarge the image if it's already smaller
        }
      ).toFormat("jpeg");

      // Convert the image to JPEG (no matter the input format)
      optimizedBuffer = await sharpInstance.jpeg({
        quality: 70,   // Set the quality (you can adjust this)
        chromaSubsampling: "4:2:0" // Efficient chroma subsampling for smaller file sizes
      }).toBuffer();

      // Extract EXIF metadata (if applicable)
      metadata = await exifr.parse(buffer, { gps: true });
    } catch (sharpError) {
      console.error(`Sharp lib image processing failed:`, sharpError);
    }

    // Convert the JPEG buffer to a base64 string
    const base64 = `data:image/jpeg;base64,${optimizedBuffer.toString("base64")}`;

    // Return the base64 string and the metadata
    return { base64, metadata };
  } catch (error) {
    console.error(`Error processing image ${url}:`, error);
    throw error;
  }
};
