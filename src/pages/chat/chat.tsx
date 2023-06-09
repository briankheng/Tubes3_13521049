import SideBarPage from "@/components/sidebar/sidebar-page/sidebar-page";
import ChatWindowPage from "@/components/chat-window/chat-window-page/chat-window-page";
import { useContext, useEffect } from "react";
import { ChatContext } from "@/context/chat-context";
import useChats from "@/hooks/useChats";
import axios from "axios";

const Chat = () => {
  const { currentChat, setCurrentChat } = useContext(ChatContext);

  const { chats, isLoading: chatLoading, mutate: chatMutate } = useChats();

  const newChat = async () => {
    await axios.post("api/chat/create");
    chatMutate();
  };

  const setChat = () => {
    if (!chatLoading && chats) {
      chatMutate();
      if (currentChat === "" && chats.length > 0) {
        const lastChat = chats[0].id.toString();
        setCurrentChat(lastChat);
      }
    }
  };

  useEffect(() => {
    if (!chatLoading && chats) {
      if (chats.length === 0) {
        newChat();
        setCurrentChat("");
      }
    }
  }, [chats]);

  setChat();

  return (
    <div className="bg-custom-chat_window min-h-screen flex overflow-x-hidden">
      <SideBarPage />
      <ChatWindowPage />
    </div>
  );
};

export default Chat;
