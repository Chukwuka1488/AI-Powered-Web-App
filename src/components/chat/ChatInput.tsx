// src/components/chat/ChatInput.tsx

"use client";

import { Message } from "@/lib/validators/message";
import { useMutation } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { FC, HTMLAttributes, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

interface ChatInputProps extends HTMLAttributes<HTMLDivElement> {}

const ChatInput: FC<ChatInputProps> = ({ className, ...props }) => {
  const [input, setInput] = useState<string>("");

  const { mutate: sendMessage, isLoading } = useMutation({
    mutationFn: async (message: Message) => {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [message] }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to send message");
      }
      const data = response.body;
      if (!data) {
        throw new Error("No response data received");
      }

      return data;
    },
    onSuccess: () => {
      setInput(""); // Clear input after successful send
      console.log("Message sent successfully");
    },
    onError: (error: Error) => {
      console.error("Failed to send message:", error);
      // You might want to show an error toast here
    },
  });

  const handleSendMessage = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const trimmedInput = input.trim();
      if (!trimmedInput) return;

      const message: Message = {
        id: nanoid(),
        isUserMessage: true,
        text: trimmedInput,
      };

      sendMessage(message);
    }
  };

  return (
    <div {...props} className={`border-t border-stone-300 ${className || ""}`}>
      <div className="relative mt-4 flex-1 overflow-hidden rounded-lg border-none outline-none">
        <TextareaAutosize
          rows={2}
          onKeyDown={handleSendMessage}
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          placeholder="Write a message..."
          className="peer disabled:opacity-50 pr-14 resize-none block w-full border-0 bg-zinc-100 py-1.5 text-gray-900 focus:ring-0 text-sm sm:leading-6"
        />
      </div>
    </div>
  );
};

export default ChatInput;
