import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response(
      JSON.stringify({ error: "Missing URL" }),
      { status: 400 }
    );
  }

  try {
    // Fetch the image from the external server
    const response = await axios.get(url, { responseType: "arraybuffer" });

    // Convert the data to a stream
    const readableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(response.data));
        controller.close();
      }
    });

    // Return the response with the correct headers
    return new NextResponse(readableStream);
  } catch (error) {
    console.error("Error fetching image:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch image." }),
      { status: 500 }
    );
  }
}
