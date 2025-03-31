import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import { User } from "lucide-react";

function ChatContainer() {
  const { isMessagesLoading, chats, getMessages, selectUser } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectUser?._id) {
      getMessages(selectUser._id);
    }
  }, [selectUser, getMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isMessagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="loading loading-spinner loading-md"></div>
          </div>
        ) : chats.length > 0 ? (
          <>
            {chats.map((chat) => (
              <div
                key={chat._id}
                className={`chat ${
                  chat.senderId === authUser?.user?._id
                    ? "chat-end"
                    : "chat-start"
                }`}
              >
                <div className="chat-image avatar">
                  <div className="w-10 h-10 rounded-full">
                    {chat.senderId === authUser?.user?._id ? (
                      authUser?.user?.avatar ? (
                        <img
                          src={authUser.user.avatar}
                          alt={authUser.user.fullname}
                        />
                      ) : (
                        <div className="bg-primary flex items-center justify-center w-full h-full">
                          <User className="text-white" size={20} />
                        </div>
                      )
                    ) : selectUser?.avatar ? (
                      <img src={selectUser.avatar} alt={selectUser.fullname} />
                    ) : (
                      <div className="bg-primary flex items-center justify-center w-full h-full">
                        <User className="text-white" size={20} />
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className={`px-4 py-3 rounded-lg max-w-xs md:max-w-md ${
                    chat.senderId === authUser?.user?._id
                      ? "bg-primary text-white ml-auto"
                      : "bg-base-200 mr-auto"
                  }`}
                >
                  {chat.text}
                  {chat.image && (
                    <div className="mt-2">
                      <img
                        src={chat.image}
                        alt="Message attachment"
                        className="rounded-md w-full"
                        onClick={() => window.open(chat.image, "_blank")}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  )}
                </div>
                <div className="chat-footer opacity-50 text-xs">
                  {new Date(chat.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400">
              Send a message to start the conversation
            </p>
          </div>
        )}
      </div>
      <ChatInput />
    </div>
  );
}

export default ChatContainer;
