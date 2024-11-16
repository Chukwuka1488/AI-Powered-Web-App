import { createParser } from "eventsource-parser";

export type ChatGPTAgent = "user" | "system" | "assistant";

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}

export interface OpenAIStreamPayload {
  model: string;
  messages: ChatGPTMessage[];
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
}

export async function OpenAIStream(payload: OpenAIStreamPayload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.text().catch(() => null);
    console.error(
      `OpenAI API error: ${res.status} ${res.statusText}`,
      errorData
    );
    throw new Error(
      `OpenAI API error: ${res.status} ${res.statusText}${
        errorData ? `\n${errorData}` : ""
      }`
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const parser = createParser({
        onEvent(event) {
          const data = event.data;

          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            console.log("json", json);
            const text = json.choices[0]?.delta?.content || "";
            console.log("text", text);
            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }

            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            console.error("Error parsing event:", e);
            controller.error(e);
          }
        },
        onError(err) {
          console.error("Parser error:", err);
          controller.error(err);
        },
      });

      const reader = res.body?.getReader();
      if (!reader) {
        controller.error(new Error("No reader available"));
        return;
      }

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value);
          parser.feed(chunk);
        }
      } catch (e) {
        console.error("Stream processing error:", e);
        controller.error(e);
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });

  return stream;
}
