"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, X } from "lucide-react";
import socket from "@/utils/socket";
import { useUser } from "@/context/user";
import { API_URL, GOBUSLY_SUPPORT_USER_ID } from "@/environment";

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
}

interface TypingInfo {
  sender: string;
  isTyping: boolean;
}

export default function SupportChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { user } = useUser();

  useEffect(() => {
    setupSocketListeners();
    if (isChatOpen) {
      fetchMessages();
    }

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isChatOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupSocketListeners = () => {
    if (!user?._id) return;

    socket.emit("joinRoom", user._id);

    socket.on("receiveMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("typing", (typingInfo: TypingInfo) => {
      if (typingInfo.sender !== user._id) {
        setIsTyping(typingInfo.isTyping);
        if (typingInfo.isTyping) {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      }
    });
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_URL}/operator/messages/${GOBUSLY_SUPPORT_USER_ID}?sender=${user?._id}`
      );
      const data = await response.json();
      setMessages(data.data);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !user?._id) return;

    const message: Partial<Message> = {
      sender: user._id,
      receiver: GOBUSLY_SUPPORT_USER_ID,
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    socket.emit("sendMessage", message);
    setMessages((prev) => [...prev, message as Message]);
    setNewMessage("");
  };

  const handleTyping = () => {
    if (!user?._id) return;

    socket.emit("typing", {
      sender: user._id,
      receiver: GOBUSLY_SUPPORT_USER_ID,
      isTyping: true,
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isChatOpen && (
        <Button onClick={toggleChat} className="rounded-full w-16 h-16">
          <MessageCircle size={24} />
        </Button>
      )}
      {isChatOpen && (
        <Card className="w-80 h-[500px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 border-b">
            <CardTitle className="text-sm font-semibold">
              Go Busly Support
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={toggleChat}>
              <X size={18} />
            </Button>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden p-0">
            <ScrollArea className="h-full p-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex mb-4 ${
                      msg.sender === user?._id ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender !== user?._id && (
                      <Avatar className="w-8 h-8 mr-2">
                        <AvatarImage src="/support-avatar.png" />
                        <AvatarFallback>GS</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.sender === user?._id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isTyping && (
                <div className="text-muted-foreground italic text-sm">
                  Support is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>
          <Separator />
          <CardContent className="p-4">
            <div className="flex items-center">
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleTyping}
                onKeyUp={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 mr-2"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
