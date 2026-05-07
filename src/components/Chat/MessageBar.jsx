import React, { useEffect, useRef, useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { ImAttachment } from "react-icons/im";
import { FaMicrophone } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import axios from "axios";
import { ADD_IMAGE_MESSAGE_ROUTE, ADD_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import EmojiPicker from "emoji-picker-react";
import dynamic from "next/dynamic";
import PhotoPicker from "../common/PhotoPicker";

const CaptureAudio = dynamic(() => import("@/components/common/CaptureAudio"), {
  ssr: false,
});

export default function MessageBar() {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [grabImage, setGrabImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const photoPickerOnChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendImage = async () => {
    if (!selectedFile || isSending) return;
    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      const response = await axios.post(ADD_IMAGE_MESSAGE_ROUTE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          from: userInfo.id,
          to: currentChatUser.id,
        },
      });
      if (response.status === 201) {
        socket.current.emit("send-msg", {
          to: currentChatUser.id,
          from: userInfo.id,
          message: response.data.message,
        });
        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: {
            ...response.data.message,
          },
          fromSelf: true,
        });
      }
      cancelImagePreview();
    } catch (err) {
      console.log(err);
    } finally {
      setIsSending(false);
    }
  };

  const isVideoFile = selectedFile?.type?.startsWith('video/');

  const cancelImagePreview = () => {
    setImagePreview(null);
    setSelectedFile(null);
  };

  const [{ socket, currentChatUser, userInfo }, dispatch] = useStateProvider();
  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      setMessage("");
      const { data } = await axios.post(ADD_MESSAGE_ROUTE, {
        to: currentChatUser.id,
        from: userInfo.id,
        message,
      });
      socket.current.emit("send-msg", {
        to: currentChatUser.id,
        from: userInfo.id,
        message: data.message,
      });
      dispatch({
        type: reducerCases.ADD_MESSAGE,
        newMessage: {
          ...data.message,
        },
        fromSelf: true,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmojiModal = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emoji, event) => {
    setMessage((prevMessage) => (prevMessage += emoji.emoji));
  };

  const emojiPickerRef = useRef(null); // Create a ref for the emoji picker element

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.id !== "emoji-open") {
        if (
          emojiPickerRef.current && // Check if the emoji picker ref exists
          !emojiPickerRef.current.contains(event.target) // Check if the click is outside of the emoji picker
        ) {
          setShowEmojiPicker(false); // Close the emoji picker
        }
      }
    };

    document.addEventListener("click", handleOutsideClick); // Add the event listener

    return () => {
      document.removeEventListener("click", handleOutsideClick); // Clean up the event listener on component unmount
    };
  }, []); // Empty dependency array ensures the effect runs only once

  useEffect(() => {
    setMessage("");
  }, [currentChatUser]);

  useEffect(() => {
    if (grabImage) {
      const data = document.getElementById("photo-picker");
      data.click();
      document.body.onfocus = (e) => {
        setTimeout(() => {
          setGrabImage(false);
        }, 1000);
      };
    }
  }, [grabImage]);

  return (
    <div className="bg-panel-header-background  h-20 px-4 flex items-center gap-6  relative">
      {!showAudioRecorder && (
        <>
          <div className="flex gap-6">
            <BsEmojiSmile
              className="text-panel-header-icon cursor-pointer text-xl"
              title="Emoji"
              onClick={handleEmojiModal}
              id="emoji-open"
            />
            {showEmojiPicker && (
              <div
                className="absolute bottom-24 left-16 z-40"
                ref={emojiPickerRef}
              >
                <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
              </div>
            )}
            <ImAttachment
              className="text-panel-header-icon cursor-pointer text-xl"
              title="Attach"
              onClick={() => setGrabImage(true)}
            />
          </div>
          <div className="w-full rounded-lg h-10 flex items-center">
            <input
              type="text"
              placeholder="Type a message"
              className="bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg pl-5 pr-5 py-4 w-full"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className=" w-10 flex items-center justify-center">
            {message.length ? (
              <button onClick={sendMessage}>
                <MdSend
                  className="text-panel-header-icon cursor-pointer text-xl"
                  title="Send"
                />
              </button>
            ) : (
              <FaMicrophone
                className="text-panel-header-icon cursor-pointer text-xl"
                title="Record"
                onClick={() => setShowAudioRecorder(true)}
              />
            )}
          </div>
        </>
      )}
      {showAudioRecorder && <CaptureAudio hide={setShowAudioRecorder} />}
      {grabImage && <PhotoPicker onChange={photoPickerOnChange} />}
      
      {/* Image/Video Preview Modal */}
      {imagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-panel-header-background rounded-lg p-4 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white text-lg">{isVideoFile ? 'Send Video' : 'Send Image'}</span>
              <button
                onClick={cancelImagePreview}
                disabled={isSending}
                className="text-gray-400 hover:text-white text-2xl disabled:opacity-50"
              >
                &times;
              </button>
            </div>
            <div className="flex justify-center mb-4">
              {isVideoFile ? (
                <video
                  src={imagePreview}
                  controls
                  className="max-h-80 rounded-lg"
                />
              ) : (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-80 rounded-lg object-contain"
                />
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelImagePreview}
                disabled={isSending}
                className="px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={sendImage}
                disabled={isSending}
                className="px-4 py-2 text-white bg-[#00a884] rounded-lg hover:bg-[#06cf9c] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdSend /> {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
