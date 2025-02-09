import React, { useEffect } from "react";

type Message = {
  role: string;
  content: string;
};

export const SendMessage = ({
  engine,
  isLoading,
  setIsLoading,
  setMessages,
  messages,
  containerRef,
  setStreamReply,
}: {
  engine: any;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  messages: Message[];
  containerRef: React.RefObject<HTMLElement>;
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

  const sendMessage = async (e) => {
    e.preventDefault();
    const input = e.target[0];

    if (input.value.trim() === "") {
      return alert("El mensaje no puede estar vacío");
    }

    const userMessage = {
      role: "user",
      content: input.value,
    };

    try {
      addMessage(userMessage);
      input.value = "";
      setIsLoading(true);

      const updatedMessages = messages;

      const chunks = await engine.chat.completions.create({
        messages: [...updatedMessages, userMessage],
        stream: true,
      });

      let reply = "";

      for await (const chunk of chunks) {
        const choice = chunk.choices[0];
        reply += choice.delta.content ?? "";
        setStreamReply(reply);
        scrollToBottom();
      }

      setStreamReply("");

      const assistantMessage = {
        role: "assistant",
        content: reply,
      };

      setMessages([...updatedMessages, userMessage, assistantMessage]);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={sendMessage} className="w-1/3 flex gap-4">
      <input
        type="text"
        placeholder="Escribe aqui..."
        className="w-full p-2 bg-white rounded-lg"
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
