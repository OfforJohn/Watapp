import React, { useRef, useState } from "react";
import Avatar from "../common/Avatar";
import { BsFillChatLeftTextFill, BsThreeDotsVertical } from "react-icons/bs";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { useRouter } from "next/router";
import ContextMenu from "../common/ContextMenu";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ChatListHeader() {
  const [{ userInfo }, dispatch] = useStateProvider();
  const router = useRouter();

  // Refs and state for context menu & file input
  const [contextMenuCordinates, setContextMenuCordinates] = useState({ x: 0, y: 0 });
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const fileInputRef = useRef(null); // For file picker

  // Broadcast modal state
  const [isBroadcastModalVisible, setIsBroadcastModalVisible] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");

  // Show context menu
  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCordinates({ x: e.pageX, y: e.pageY });
    setIsContextMenuVisible(true);
    console.log("Context menu opened at:", { x: e.pageX, y: e.pageY });
  };

  // Trigger file selector on import action
  const handleImportUsers = () => {
    setIsContextMenuVisible(false);
    console.log("Opening file selector...");
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // After file selection, ignore file and send static startingId
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    console.log("User selected file:", file.name);
    try {
      const res = await axios.post(
        "https://first-wave-card.glitch.me/api/auth/add-batch-users",
        { startingId: 100 }
      );
      console.log("Import response:", res.data);
      toast.success(res.data.message || "Users imported successfully");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error("Import error:", err);
      toast.error(err?.response?.data?.message || "Failed to import users");
    }
  };

  // Delete users handler

const handleDeleteAllUsers = async () => {
  try {
    setIsContextMenuVisible(false);
    const startId = 3;
    console.log("Deleting users starting from ID:", startId);
    const res = await axios.delete(`https://first-wave-card.glitch.me/api/auth/delete-batch-users/${startId}`);
    console.log("Delete response:", res.data);
    toast.success(res.data.message || "Users deleted successfully");
    
    // Reload the page after a short delay to allow the toast to show
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (err) {
    console.error("Delete error:", err);
    toast.error(err?.response?.data?.message || "Failed to delete users");
  }
};
const handleBroadcastToAll = async () => {
    try {
      if (!broadcastMessage.trim()) {
        toast.error("Please enter a message to broadcast.");
        console.warn("Broadcast aborted: empty message");
        return;
      }

      console.log("Broadcasting message:", broadcastMessage);
      setIsBroadcastModalVisible(false);
      const userId = parseInt(localStorage.getItem("userId"));

      const res = await axios.post("https://first-wave-card.glitch.me/api/auth/message/broadcast", {
        message: broadcastMessage,
        senderId: userId, // or whatever key your backend expects
      });
      console.log("Broadcast response:", res.data);
      toast.success(res.data.message || "Broadcast sent successfully");

 
      setBroadcastMessage("");
    } catch (err) {
      console.error("Broadcast error:", err);
    }
  };

  // Navigate to All Contacts page
  const handleAllContactsPage = () => {
    console.log("Navigating to All Contacts page");
    dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
  };

  // Context menu options
  const contextMenuOptions = [
    { name: "Import Contacts", callBack: handleImportUsers },
    { name: "Delete All Contacts", callBack: handleDeleteAllUsers },
    {
      name: "Broadcast to All",
      callBack: () => setIsBroadcastModalVisible(true),
    },
    {
      name: "Logout",
      callBack: async () => {
        console.log("Logging out...");
        setIsContextMenuVisible(false);
        router.push("/logout");
      },
    },
  ];

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div className="cursor-pointer">
        <Avatar type="sm" image={userInfo?.profileImage} />
      </div>

      <div className="flex gap-6">
        <BsFillChatLeftTextFill
          className="text-panel-header-icon cursor-pointer text-xl"
          title="New chat"
          onClick={handleAllContactsPage}
        />

        <>
          <BsThreeDotsVertical
            className="text-panel-header-icon cursor-pointer text-xl"
            title="Menu"
            onClick={showContextMenu}
            id="context-opener"
          />

          {isContextMenuVisible && (
            <ContextMenu
              options={contextMenuOptions}
              cordinates={contextMenuCordinates}
              contextMenu={isContextMenuVisible}
              setContextMenu={setIsContextMenuVisible}
            />
          )}
        </>
      </div>

      {/* Broadcast Modal */}
      {isBroadcastModalVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Broadcast Message to All</h2>
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Enter your message here"
              rows="4"
            />
            <div className="flex justify-between mt-4">
              <button
                className="bg-blue-500 text-white p-2 rounded-md"
                onClick={handleBroadcastToAll}
              >
                Send
              </button>
              <button
                className="bg-gray-300 p-2 rounded-md"
                onClick={() => setIsBroadcastModalVisible(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
