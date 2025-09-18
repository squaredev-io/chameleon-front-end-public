"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { Bot, Loader, SendHorizontal, User } from "lucide-react";

const USER = "user";
const ASSISTANT = "assistant";
const MESSAGE_LIMIT = 10;

// The handler that sends messages to the assistant and gets the streaming response
const initiateAndChatWithAiAssistant = async (message: string, threadId: string, onStream: (content: string) => void) => {
  try {
    const runRes = await fetch("/api/create-run", {
      method: "POST",
      body: JSON.stringify({
        thread_id: threadId,
        message
      })
    });

    if (!runRes.ok || !runRes.body) {
      throw new Error(`Create-Run for AI Assistant API request failed: ${runRes.status}`);
    }

    const reader = runRes.body.pipeThrough(new TextDecoderStream("utf-8"))
      .getReader();

    let buffer = "";
    let streamedContent = "";
    let firstLoop = true;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      } else if (!done && !firstLoop) {
        onStream(streamedContent);
      }

      // Append new chunk to buffer and process
      buffer += value;

      // Process complete events from buffer
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim() === "" || !line.startsWith("data:")) {
          continue;
        }

        const data = line.slice(5); // Remove "data:" prefix

        try {
          const parsed = JSON.parse(data);

          // Update content if present
          if (parsed.content) {
            streamedContent += parsed.content;
            firstLoop = false;
          }
        } catch (e) {
          console.error("Error parsing JSON (content):", e);
        }
      }
    }

    // Handle any remaining buffer content after completion
    if (buffer) {
      try {
        const parsed = JSON.parse(buffer);
        if (parsed.content) {
          streamedContent += parsed.content;
          onStream(streamedContent);
        }
      } catch (e) {
        // Ignore parsing errors for incomplete buffer content
        console.error("Error parsing JSON (buffer):", e);
      }
    }
  } catch (error) {
    console.error("AI Assistant Response Streaming error:", error);
    throw error;
  }
};

const MarkdownComponents: Components = {
  // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
  code({ node, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = !match && !className;

    return isInline ? (
      <code className="bg-gray-200 dark:bg-gray-800 rounded px-1 py-0.5" {...props}>
        {children}
      </code>
    ) : (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <code className="block p-4 text-sm overflow-x-auto" {...props}>
          {children}
        </code>
      </div>
    );
  }
};

// The component that renders the message - supports Markdown syntax
const MessageContent = ({ content }) => (
  <ReactMarkdown
    className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:p-4 prose-pre:bg-gray-800 prose-pre:rounded-lg"
    components={MarkdownComponents}
  >
    {content}
  </ReactMarkdown>
);

// The container component that holds and displays the messages of the user and assistant
const MessagesContainer = ({ messages, isGenerating }) => {
  const messagesEndRef = useRef<HTMLDivElement>({} as HTMLDivElement);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
      {
        messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex items-start gap-4 ${
              message.sender === USER ? "justify-end" : "justify-start"
            }`}
          >
            {
              message.sender === ASSISTANT && (
                <div
                  className="w-8 h-8 rounded-full bg-chamPurple-200 flex items-center justify-center flex-shrink-0">
                  {
                    isGenerating && index === messages.length - 1 ? (
                      <Loader className="w-5 h-5 text-gray-500 animate-spin" />
                    ) : (
                      <Bot className="w-5 h-5 text-gray-500" />
                    )
                  }
                </div>
              )
            }
            <div
              className={`max-w-[80%] rounded-lg p-4 text-gray-500 ${
                message.sender === USER ? "bg-chamBeige-300" : "bg-chamBeige-400"
              }`}
            >
              <MessageContent content={message.content} />
            </div>
            {
              message.sender === USER && (
                <div className="w-8 h-8 rounded-full bg-chamPurple-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
              )
            }
          </div>
        ))
      }
      <div ref={messagesEndRef} />
      {/* Invisible element for scrolling */}
    </div>
  );
};

// The component that renders the input field and submit/stop buttons
const ChatInputComponent = (
  { inputRef, handleSubmit, inputMessage, setInputMessage, isGenerating, isLimitReached, countdown }
) => (
  <div className="flex-shrink-0 border-t bg-chamPurple w-full p-4">
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isLimitReached ? `Message limit reached. Chat will refresh in ${countdown} seconds!` : "Type your message..."}
          className="w-full rounded-lg border border-gray-300 bg-chamBeige-200 p-4 pr-12 focus:outline-none focus:border-purple-600"
          disabled={isGenerating || isLimitReached}
          spellCheck="false"
          data-gramm="false"
        />
        {
          !isGenerating && (
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2">
              <SendHorizontal className="w-6 h-6" />
            </button>
          )
        }
      </div>
    </form>
  </div>
);

type MessageStructure = {
  id: number;
  content: string;
  sender: string;
}

// The Chat with Chameleon Assistant component that is rendered in the AI-Assistant page
const ChatWithAssistant = () => {
  const inputRef = useRef<HTMLInputElement>();
  const [threadId, setThreadId] = useState<string>("");
  const [messages, setMessages] = useState<MessageStructure[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [countdown, setCountdown] = useState(MESSAGE_LIMIT);

  // Generate a UUID to use for thread_id if not present already
  useEffect(() => {
    if (!threadId) {
      const newThreadId = crypto.randomUUID();
      setThreadId(newThreadId);
    }
  }, []);

  // ToDo: should probably delete this when the DIP integration happens and we have auth
  // Check if message limit is reached and handle refresh
  useEffect(() => {
    const userMessageCount = messages.filter(msg => msg.sender === USER).length;
    if (userMessageCount >= MESSAGE_LIMIT) {
      setIsLimitReached(true);

      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(timer);
            window.location.reload();
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);

      // Cleanup timer
      return () => clearInterval(timer);
    }
  }, [messages]);

  // Focus back on the input after submission
  useEffect(() => {
    if (!isGenerating) {
      inputRef?.current!.focus();
    }
  }, [isGenerating]);

  // Handle the submission of a user message and the response of the AI assistant
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isGenerating) return;

    const newMessage = {
      id: messages.length,
      content: inputMessage,
      sender: USER
    };

    const assistantMessageId = messages.length + 1;

    const initialAssistantMessage = {
      id: assistantMessageId,
      content: "",
      sender: ASSISTANT
    };

    setMessages(prev => [...prev, newMessage, initialAssistantMessage]);
    setInputMessage("");
    setIsGenerating(true);

    try {
      await initiateAndChatWithAiAssistant(
        inputMessage,
        threadId,
        (responseChunk) => {
          setMessages((prev) => (
            prev.map((msg) => (
              msg.id === assistantMessageId
                ? { ...msg, content: responseChunk }
                : msg
            ))
          ));
        }
      );
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 2,
          content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          sender: ASSISTANT
        }
      ]);
    } finally {
      // Set isGenerating flag to false and stop the loader
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen-minus-topBar">
      <MessagesContainer
        messages={messages}
        isGenerating={isGenerating}
      />
      <ChatInputComponent
        inputRef={inputRef}
        handleSubmit={handleSubmit}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        isGenerating={isGenerating}
        isLimitReached={isLimitReached}
        countdown={countdown}
      />
    </div>
  );
};

export default ChatWithAssistant;
