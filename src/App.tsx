import { useEffect, useState, useRef } from "react";
import "./App.css";
import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import MessageContainer from "./components/MessageContainer";
import { SendMessage } from "./components/SendMessage";

type Message = {
  role: string;
  content: string;
};

function App() {
  const [engineStatus, setEngineStatus] = useState("");
  const [engine, setEngine] = useState<MLCEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [streamReply, setStreamReply] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "Hola! Soy un modelo de lenguaje conversacional, puedes escribirme lo que quieras y te respondere lo mejor que pueda.",
    },
  ]);
  const SELECTED_MODEL = "Llama-3.2-3B-Instruct-q4f16_1-MLC";
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

  const containerRef = useRef<HTMLElement | null>(null);

  return (
    <>
      <main className="w-full min-h-dvh bg-gray-400 flex flex-col justify-center items-center gap-4">
        <section
          className="w-1/3 h-96 bg-white rounded-lg shadow-lg p-4 overflow-auto scroll-smooth"
          ref={containerRef}
        >
          <ul className="flex flex-col gap-4">
            {messages?.map((message: Message, index: number) => (
              <MessageContainer key={index} message={message} />
            ))}
            {streamReply !== "" && (
              <MessageContainer
                message={{ role: "assistant", content: streamReply }}
              />
            )}
          </ul>
        </section>
        <SendMessage
          engine={engine}
          messages={messages}
          setIsLoading={setIsLoading}
          setMessages={setMessages}
          setStreamReply={setStreamReply}
          containerRef={containerRef}
          isLoading={isLoading}
        />
        <small className="max-w-2xs text-center">{engineStatus}</small>
      </main>
    </>
  );
}

export default App;
