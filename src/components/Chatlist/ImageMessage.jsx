import { useStateProvider } from "@/context/StateContext";
import { HOST } from "@/utils/ApiRoutes";
import { calculateTime } from "@/utils/CalculateTime";
import Image from "next/image";
import React from "react";
import MessageStatus from "../common/MessageStatus";

function ImageMessage({ message }) {
  const [{ currentChatUser, userInfo }] = useStateProvider();
  
  const mediaUrl = `${HOST}/${message.message}`;
  const isVideo = message.message?.match(/\.(mp4|webm|ogg|mov)$/i);

  return (
    <div className="relative inline-block">
      {isVideo ? (
        <video
          src={mediaUrl}
          className="rounded-lg"
          controls
          style={{ maxWidth: "300px", maxHeight: "300px" }}
        />
      ) : (
        <Image
          src={mediaUrl}
          className="rounded-lg"
          alt="asset"
          height={300}
          width={300}
          style={{ objectFit: "cover" }}
        />
      )}
      <div className="absolute bottom-1 right-1 flex items-end gap-1 bg-black bg-opacity-50 rounded px-1">
        <span className="text-white text-[11px] pt-1 min-w-fit">
          {calculateTime(message.createdAt)}
        </span>
        <span className="text-white">
          {message.senderId === userInfo.id && (
            <MessageStatus messageStatus={message.messageStatus} />
          )}
        </span>
      </div>
    </div>
  );
}

export default ImageMessage;
