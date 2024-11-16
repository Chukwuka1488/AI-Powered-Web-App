"use client";

import { MessagesContext } from "@/context/messages";
import { cn } from "@/lib/utils";
import { FC, HTMLAttributes, useContext } from "react";
import MarkdownLite from "./MarkdownLite";

type ChatMessagesProps = HTMLAttributes<HTMLDivElement>;

const ChatMessages: FC<ChatMessagesProps> = ({ className, ...props }) => {
  const { messages } = useContext(MessagesContext);
  const inverseMessages = [...messages].reverse();

  return (
    <div
      {...props}
      className={cn(
        "flex flex-col-reverse gap-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch",
        className
      )}
    >
      <div className="flex-1 flex-grow" />
      {inverseMessages.map((message) => (
        <div key={message.id} className="chat-message w-full">
          <div
            className={cn("flex items-end", {
              "justify-end": message.isUserMessage,
              "justify-start": !message.isUserMessage,
            })}
          >
            <div
              className={cn(
                "flex flex-col space-y-2 text-sm w-[80%] max-w-md mx-2", // Added fixed width and max-width
                {
                  "items-end ml-auto": message.isUserMessage,
                  "items-start mr-auto": !message.isUserMessage,
                }
              )}
            >
              <div
                className={cn("px-2 py-0.5 rounded-lg w-fit", {
                  // Added w-fit to prevent full width
                  "bg-blue-600 text-white ml-auto": message.isUserMessage,
                  "bg-gray-200 text-gray-900 mr-auto": !message.isUserMessage,
                  "rounded-br-none": message.isUserMessage,
                  "rounded-bl-none": !message.isUserMessage,
                })}
              >
                <MarkdownLite text={message.text} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
