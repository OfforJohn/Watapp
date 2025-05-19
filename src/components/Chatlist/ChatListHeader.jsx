import React, { useState } from "react";
import Avatar from "../common/Avatar";
import { BsFillChatLeftTextFill, BsThreeDotsVertical } from "react-icons/bs";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { useRouter } from "next/router";
import ContextMenu from "../common/ContextMenu";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ... imports remain unchanged

export default function ChatListHeader() {
  const [{ userInfo }, dispatch] = useStateProvider();
  const router = useRouter();
  const [contextMenuCordinates, setContextMenuCordinates] = useState({ x: 0, y: 0 });
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [isBroadcastModalVisible, setIsBroadcastModalVisible] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");

  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCordinates({ x: e.pageX, y: e.pageY });
    setIsContextMenuVisible(true);
    console.log("Context menu opened at:", { x: e.pageX, y: e.pageY });
  };

const handleImportUsers = async () => {
  try {
    setIsContextMenuVisible(false);
    console.log("Importing users...");
    const res = await axios.post("https://first-wave-card.glitch.me/api/auth/add-batch-users", {
      startingId: 100,
    });
    console.log("Import response:", res.data);
    toast.success(res.data.message || "Users imported successfully");

    // Reload the page after a short delay
   
  } catch (err) {
    console.error("Import error:", err);
    toast.error(err?.response?.data?.message || "Failed to import users");
  }
};


const handleDeleteAllUsers = async () => {
  try {
    setIsContextMenuVisible(false);
    const startId = 100;
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
      toast.error(err?.response?.data?.message || "Failed to send broadcast");
    }
  };

  const handleAllContactsPage = () => {
    console.log("Navigating to All Contacts page");
    dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
  };

  const contextMenuOptions = [
    {
      name: "Import Contacts",
      callBack: handleImportUsers,
    },
    {
      name: "Delete All Contacts",
      callBack: handleDeleteAllUsers,
    },
    {
      name: "Broadcast to All",
      callBack: () => {
        console.log("Opening broadcast modal");
        setIsBroadcastModalVisible(true);
      },
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
            onClick={(e) => showContextMenu(e)}
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
              onChange={(e) => {
                console.log("Broadcast message input:", e.target.value);
                setBroadcastMessage(e.target.value);
              }}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Enter your message here"
              rows="4"
            ></textarea>
            <div className="flex justify-between mt-4">
             <button
  className="bg-blue-500 text-white p-2 rounded-md"
  onClick={async () => {
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
        senderId: userId,
      });

      console.log("Broadcast response:", res.data);
      toast.success(res.data.message || "Broadcast sent successfully");
    } catch (err) {
      console.error("Broadcast error:", err);
     
    } finally {
      setBroadcastMessage("");
    
    }
  }}
>
  Send
</button>

              <button
                className="bg-gray-300 p-2 rounded-md"
                onClick={() => {
                  console.log("Closing broadcast modal");
                  setIsBroadcastModalVisible(false);
                }}
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
