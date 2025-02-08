type Message = {
  role: string;
  content: string;
};

const MessageContainer = ({
  index,
  message,
}: {
  index?: number;
  message: Message;
}) => {
  return (
    <li
      key={index || -5}
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
  );
};

export default MessageContainer;
