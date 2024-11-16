import { chatbotPrompt } from "@/app/helpers/constants/chatbot-prompt";
import {
  ChatGPTMessage,
  OpenAIStream,
  OpenAIStreamPayload,
} from "@/lib/openai-stream";
import { MessageArraySchema } from "@/lib/validators/message";
import { NextResponse } from "next/server";

// Define a custom error interface
interface ApiError extends Error {
  status?: number;
}

export async function POST(req: Request) {
  try {
    // Log API key presence (but not the actual key)
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return new NextResponse("OpenAI API key not configured", { status: 500 });
    }
    console.log("API Key is configured");

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("Request body received:", {
        messages: body.messages?.length,
      });
    } catch (e) {
      console.error("Failed to parse request JSON:", e);
      return new NextResponse("Invalid JSON", { status: 400 });
    }

    // Validate messages
    let parsedMessages;
    try {
      parsedMessages = MessageArraySchema.parse(body.messages);
      console.log("Messages validated successfully");
    } catch (e) {
      console.error("Message validation failed:", e);
      return new NextResponse("Invalid message format", { status: 400 });
    }

    // Transform messages
    const outboundMessages: ChatGPTMessage[] = parsedMessages.map(
      (message) => ({
        role: message.isUserMessage ? "user" : "assistant",
        content: message.text,
      })
    );

    outboundMessages.unshift({
      role: "system",
      content: chatbotPrompt,
    });

    console.log(
      "Prepared messages for OpenAI:",
      outboundMessages.map((m) => ({
        role: m.role,
        contentLength: m.content.length,
      }))
    );

    const payload: OpenAIStreamPayload = {
      model: "gpt-3.5-turbo",
      messages: outboundMessages,
      temperature: 0.4,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 150,
      stream: true,
      n: 1,
    };

    console.log("Creating OpenAI stream...");
    const stream = await OpenAIStream(payload);
    console.log("Stream created successfully");

    return new Response(stream);
  } catch (error: unknown) {
    console.error("Error in message route:", error);

    // Type guard for error handling
    if (error instanceof Error) {
      const apiError = error as ApiError;
      return new NextResponse(apiError.message || "An error occurred", {
        status: apiError.status || 500,
      });
    }

    //  Fallback for unknown error types
    return new NextResponse("An unknown error occurred", { status: 500 });
  }
}
