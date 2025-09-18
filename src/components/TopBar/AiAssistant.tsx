import Link from "next/link";
import Image from "next/image";
import ChatIcon from "/public/icons/chat-light.png";

const AiAssistant = () => {
  return (
    <Link href="/ai-assistant" className="order-1">
      <Image
        src={ChatIcon}
        alt="chat-icon"
      />
    </Link>
  );
};

export default AiAssistant;
