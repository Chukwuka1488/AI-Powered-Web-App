// src/components/chat/Chat.tsx

"use client";
import { FC } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";

const Chat: FC = () => {
  return (
    <div className="fixed right-8 w-80 bottom-8">
      <Accordion type="single" collapsible>
        <AccordionItem value="chat">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <ChatHeader />
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col h-80">
              <div className="flex-1 px-6 py-4">Messages will appear here</div>
              <div className="px-6 pb-4">
                <ChatInput />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Chat;
