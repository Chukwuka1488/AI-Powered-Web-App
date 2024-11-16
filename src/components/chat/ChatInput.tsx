// src/components/chat/ChatInput.tsx

"use client";

import { MessagesContext } from "@/context/messages";
import { cn } from "@/lib/utils";
import { Message } from "@/lib/validators/message";
import { useMutation } from "@tanstack/react-query";
import { CornerDownLeft, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { FC, HTMLAttributes, useContext, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import toast from "react-hot-toast";

// interface ChatInputProps extends HTMLAttributes<HTMLDivElement> {}
// this is a cleaner way to write the interface is the interface doesn't have a value
type ChatInputProps = HTMLAttributes<HTMLDivElement>;

const ChatInput: FC<ChatInputProps> = ({ className, ...props }) => {
  const [input, setInput] = useState<string>("");
  const {
    // messages,
    addMessage,
    removeMessage,
    updateMessage,
    // isMessageUpdating,
    setIsMessageUpdating,
  } = useContext(MessagesContext);
  const textareaRef = useRef<null | HTMLTextAreaElement>(null);
  const { mutate: sendMessage, isPending } = useMutation({
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
    onMutate(message) {
      addMessage(message);
    },
    onSuccess: async (stream) => {
      if (!stream) throw new Error("No Stream Found");

      const id = nanoid();
      const responseMessage: Message = {
        id,
        isUserMessage: false,
        text: "",
      };

      addMessage(responseMessage);
      setIsMessageUpdating(true);

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        updateMessage(id, (prev) => prev + chunkValue);
        console.log(chunkValue);
      }
      // clean up
      setIsMessageUpdating(false);
      setInput(""); // Clear input after successful send
      console.log("Message sent successfully");

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 10);
    },
    onError: (error: Error, message) => {
      toast.error(error.message || "Failed to send message. Please try again!");
      console.error("Failed to send message:", error);
      // add subsequent errors handling here
      removeMessage(message.id);
      textareaRef.current?.focus();
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
          ref={textareaRef}
          rows={2}
          onKeyDown={handleSendMessage}
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isPending}
          autoFocus
          placeholder={isPending ? "Sending message..." : "Write a message..."}
          className={cn(
            "peer resize-none block w-full border-0 bg-zinc-100 py-1.5 text-gray-900 focus:ring-0 text-sm sm:leading-6 pr-14",
            isPending && "opacity-50 cursor-not-allowed"
          )}
          // className="peer disabled:opacity-50 pr-14 resize-none block w-full border-0 bg-zinc-100 py-1.5 text-gray-900 focus:ring-0 text-sm sm:leading-6"
        />
        <div className="absolute inset-y-0  right-0 flex py-1.5  pr-1.5">
          <kbd className="inline-flex items-center rounded border bg-white border-gray-200 px-1 font-sans text-xs text-gray-400">
            {isPending ? (
              <Loader2 className=" w-3 h-3 animate-spin" />
            ) : (
              <CornerDownLeft className="w-3 h-3" />
            )}
          </kbd>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 border-t border-gray-300 peer-focus:border-t-2 peer-focus:border-indigo-600"
        />
      </div>
    </div>
  );
};

export default ChatInput;
