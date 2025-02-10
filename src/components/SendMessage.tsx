import { MLCEngine } from "@mlc-ai/web-llm";
import React, { useEffect } from "react";

type Message =
  | { role: "user" | "assistant" | "system"; content: string }
  | { role: "tool"; content: string; tool_call_id: string };

export const SendMessage = ({
  engine,
  isLoading,
  setIsLoading,
  setMessages,
  messages,
  containerRef,
  setStreamReply,
}: {
  engine: MLCEngine | null;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  messages: Message[];
  containerRef: React.RefObject<HTMLElement | null>;
  setStreamReply: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const scrollToBottom = () => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message: Message) => {
    const newMessages = [...messages, message];
    setMessages([...newMessages]);
  };

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("message") as HTMLInputElement;

    if (input.value.trim() === "") {
      return alert("El mensaje no puede estar vacío");
    }

    const userMessage: Message = {
      role: "user",
      content: input.value,
    };

    try {
      addMessage(userMessage);
      input.value = "";
      setIsLoading(true);

      if (!engine) {
        return;
      }

      const updatedMessages = [...messages, userMessage];

      const chunks = await engine.chat.completions.create({
        messages: updatedMessages,
        stream: true,
      });

      let reply = "";

      for await (const chunk of chunks) {
        const choice = chunk.choices[0];
        reply += choice.delta?.content ?? "";
        setStreamReply(reply);
        scrollToBottom();
      }

      setStreamReply("");

      const assistantMessage: Message = {
        role: "assistant",
        content: reply,
      };

      setMessages([...updatedMessages, assistantMessage]);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={sendMessage} className="hidden w-1/3 md:flex gap-4">
      <input
        type="text"
        placeholder="Escribe aqui..."
        className="w-full p-2 bg-white rounded-lg"
        name="message"
      />
      <button
        disabled={isLoading}
        className="bg-blue-600 p-2 rounded-lg cursor-pointer text-white disabled:opacity-45"
      >
        Enviar
      </button>
    </form>
  );
};
