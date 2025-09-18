import { Config } from "../../../config";

const MESSAGE_LIMIT = 10;

// In-memory storage for message counts
const threadMessageCounts = new Map<string, { count: number; timestamp: number }>();

// Cleanup function to remove old thread counts (run every hour)
const cleanupOldThreads = () => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour in milliseconds
  for (const [threadId, data] of threadMessageCounts.entries()) {
    if (data.timestamp < oneHourAgo) {
      threadMessageCounts.delete(threadId);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupOldThreads, 60 * 60 * 1000);

export async function POST(req: Request) {
  const encoder = new TextEncoder();

  try {
    const { thread_id, message, streaming = true } = await req.json();

    if (!thread_id || !message) {
      return new Response(
        JSON.stringify({ error: "Field message is required!" }),
        { status: 400 }
      );
    }

    // Get or initialize thread count
    const threadData = threadMessageCounts.get(thread_id) || { count: 0, timestamp: Date.now() };

    // Check message limit
    if (threadData.count >= MESSAGE_LIMIT) {
      return new Response(
        JSON.stringify({
          error: "Message limit reached for this thread",
          messageCount: threadData.count
        }),
        { status: 429 }
      );
    }

    // Increment message count and update timestamp
    threadData.count += 1;
    threadData.timestamp = Date.now();
    threadMessageCounts.set(thread_id, threadData);

    const runResponse = await fetch(`${Config.assistantUrl}agent/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(Config.assistantApiKey ? { "X-API-Key": Config.assistantApiKey } : {})
      },
      body: JSON.stringify({
        message: message.trim(),
        thread_id,
        stream_tokens: streaming
      })
    });

    if (!runResponse.ok || !runResponse.body) {
      const errorText = await runResponse.text();
      return new Response(JSON.stringify({ error: `Run initiation failed: ${errorText}` }), {
        status: runResponse.status
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = runResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let buffer = "";

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += new TextDecoder().decode(value);

          let newlineIndex;
          while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (line.startsWith("data:")) {
              try {
                const parsed = JSON.parse(line.slice(5).trim());
                if (parsed.content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: parsed.content })}\n\n`));
                }
              } catch (err) {
                console.error("Error parsing SSE line:", err);
              }
            }
          }
        }

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive"
      }
    });
  } catch (error) {
    console.error("Proxy SSE Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while processing SSE." }),
      { status: 500 }
    );
  }
}
