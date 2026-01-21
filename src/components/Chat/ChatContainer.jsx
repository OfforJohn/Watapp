import { useStateProvider } from "@/context/StateContext";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { calculateTime } from "@/utils/CalculateTime";
import MessageStatus from "../common/MessageStatus";
import ImageMessage from "./ImageMessage";
import { reducerCases } from "@/context/constants";
import { FaTrash } from "react-icons/fa";
import axios from "axios";

const VoiceMessage = dynamic(() => import("@/components/Chat/VoiceMessage"), {
  ssr: false,
});

export default function ChatContainer() {
  const [{ messages, currentChatUser, userInfo }, dispatch] = useStateProvider();
  const containerRef = useRef(null);
  const [deletingMessageIds, setDeletingMessageIds] = useState([]);
  const [contextTarget, setContextTarget] = useState(null); // message id when right-clicked

  // ✅ Scroll to the latest message whenever messages change
  useEffect(() => {
    const container = containerRef.current;
    const lastMessage =
      container?.lastElementChild?.lastElementChild?.lastElementChild
        ?.lastElementChild;

    if (lastMessage) lastMessage.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDeleteMessage = async (messageId) => {
    if (!messageId) return;

    try {
      setDeletingMessageIds((prev) => [...prev, messageId]);

      const res = await fetch(
        `https://render-backend1-a38s.onrender.com/api/auth/deleteMessagesByUser/${messageId}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (data.status) {
        dispatch({ type: "REMOVE_MESSAGE", payload: messageId });

        const response = await axios.get(
          `https://render-backend1-a38s.onrender.com/api/messages/get-messages/${userInfo.id}/${currentChatUser.id}`
        );

        dispatch({
          type: reducerCases.SET_MESSAGES,
          messages: response.data.messages || [],
        });
      }
    } catch (err) {
      console.error("❌ Delete failed:", err);
    } finally {
      setDeletingMessageIds((prev) =>
        prev.filter((id) => id !== messageId)
      );
      setContextTarget(null);
    }
  };

  // ✅ Close icon when clicking anywhere else
  useEffect(() => {
    const handleClick = () => setContextTarget(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      className="h-[80vh] w-full relative flex-grow overflow-auto custom-scrollbar"
      ref={containerRef}
    >
      <div className="bg-chat-background bg-fixed h-full w-full opacity-5 fixed left-0 top-0 z-0"></div>
      <div className="mx-10 my-6 relative bottom-0 z-40 left-0">
        <div className="flex flex-col justify-end w-full gap-2 overflow-auto">
          {Array.isArray(messages) &&
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 transition-opacity duration-300 ${
                  deletingMessageIds.includes(message.id)
                    ? "opacity-0"
                    : "opacity-100"
                } ${
                  message.senderId === currentChatUser.id
                    ? "justify-start"
                    : "justify-end"
                }`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (message.senderId === userInfo.id) {
                    setContextTarget(message.id);
                  }
                }}
              >
                {/* Show delete icon only if this message was right-clicked */}
                {contextTarget === message.id && message.senderId === userInfo.id && (
                  <FaTrash
                    className="text-red-500 cursor-pointer hover:text-red-600 transition"
                    onClick={() => handleDeleteMessage(message.id)}
                    title="Delete message"
                  />
                )}

                <div
                  className={`text-white px-3 py-2 text-sm rounded-md flex gap-2 items-end max-w-[45%] break-all ${
                    message.senderId === currentChatUser.id
                      ? "bg-incoming-background"
                      : "bg-outgoing-background"
                  }`}
                >
                  {message.type === "text" && (
                    <>
                      <span>{message.message}</span>
                      <div className="flex gap-1 items-end">
                        <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
                          {calculateTime(message.createdAt)}
                        </span>
                        {message.senderId === userInfo.id && (
                          <MessageStatus messageStatus={message.messageStatus} />
                        )}
                      </div>
                    </>
                  )}
                  {message.type === "image" && <ImageMessage message={message} />}
                  {message.type === "audio" && <VoiceMessage message={message} />}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
