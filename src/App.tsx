import { useEffect, useState, useRef } from "react";
import "./App.css";
import { CreateMLCEngine } from "@mlc-ai/web-llm";

type Message = {
  role: string;
  content: string;
};

function App() {
  const [engineStatus, setEngineStatus] = useState("");
  const [engine, setEngine] = useState(null);
  const [streamReply, setStreamReply] = useState("");

  const SELECTED_MODEL = "SmolLM2-360M-Instruct-q0f16-MLC";

  const loadEngine = async () => {
    const engine = await CreateMLCEngine(SELECTED_MODEL, {
      initProgressCallback: (info) => {
        setEngineStatus(info.text);
      },
    });
    return engine;
  };

  useEffect(() => {
    loadEngine().then((engine) => {
      setEngine(engine);
      setEngineStatus("Listo para recibir mensajes");
      setIsLoading(false);
    });
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "Hola! Soy un modelo de lenguaje conversacional, puedes escribirme lo que quieras y te respondere lo mejor que pueda.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef(null);

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
    <>
      <main className="w-full min-h-dvh bg-gray-400 flex flex-col justify-center items-center gap-4">
        <section
          className="w-1/3 h-96 bg-white rounded-lg shadow-lg p-4 overflow-auto scroll-smooth"
          ref={containerRef}
        >
          <ul className="flex flex-col gap-4">
            {messages?.map((message: Message, index: number) => (
              <li
                key={index}
                className={`flex flex-col gap-2 ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <span
                  className={`flex justify-center items-center p-2 rounded-full ${
                    message.role === "user" ? "bg-blue-300" : "bg-amber-100"
                  } w-[50px]`}
                >
                  {message.role === "user" ? "Vos" : "GPT"}
                </span>
                <p
                  className={`${
                    message.role === "user" ? "bg-blue-300" : "bg-amber-100"
                  } w-fit p-2 rounded-lg`}
                >
                  {message.content}
                </p>
              </li>
            ))}
            {streamReply !== "" && (
              <li className="flex flex-col gap-2 items-start">
                <span className="flex justify-center items-center p-2 rounded-full bg-amber-100 w-[50px]">
                  GPT
                </span>
                <p className="bg-amber-100 w-fit p-2 rounded-lg">
                  {streamReply}
                </p>
              </li>
            )}
          </ul>
        </section>
        <form onSubmit={sendMessage} className="flex gap-4">
          <input
            type="text"
            placeholder="Escribe aqui..."
            className="p-2 bg-white rounded-lg"
          />
          <button
            disabled={isLoading}
            className="bg-blue-600 p-2 rounded-lg cursor-pointer text-white disabled:opacity-45"
          >
            Enviar
          </button>
        </form>
        <small className="max-w-2xs text-center">{engineStatus}</small>
      </main>
    </>
  );
}

export default App;
