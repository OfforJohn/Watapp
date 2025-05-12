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

export default function ChatListHeader() {
  const [{ userInfo }, dispatch] = useStateProvider();
  const router = useRouter();
  const [contextMenuCordinates, setContextMenuCordinates] = useState({
    x: 0,
    y: 0,
  });
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [isBroadcastModalVisible, setIsBroadcastModalVisible] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");

  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCordinates({ x: e.pageX, y: e.pageY });
    setIsContextMenuVisible(true);
  };

  const handleImportUsers = async () => {
    try {
      setIsContextMenuVisible(false);
      const res = await axios.post(
        "https://first-wave-card.glitch.me/api/auth/add-batch-users",
        { startingId: 100 }
      );
      toast.success(res.data.message || "Users imported successfully");
         setTimeout(() => {
      window.location.reload();
    }, 3000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to import users");
    }
  };

  const handleDeleteAllUsers = async () => {
    try {
      setIsContextMenuVisible(false);
      const startId = 100;
      const res = await axios.delete(
        `https://first-wave-card.glitch.me/api/auth/delete-batch-users/${startId}`
      );
      toast.success(res.data.message || "Users deleted successfully");
         setTimeout(() => {
      window.location.reload();
    }, 3000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete users");

    }
  };

  const handleBroadcastToAll = async () => {
    try {
      if (!broadcastMessage.trim()) {
        toast.error("Please enter a message to broadcast.");
        return;
      }

      setIsBroadcastModalVisible(false); // Hide modal
      const res = await axios.post(
        "https://first-wave-card.glitch.me/api/auth/message/broadcast",
        { message: broadcastMessage }
      );
      toast.success(res.data.message || "Broadcast sent successfully");
      setBroadcastMessage(""); // Clear message after sending
      dispatch({
        type: reducerCases.ADD_BROADCAST_MESSAGE,
        payload: {
          message: broadcastMessage,
          timestamp: new Date().toISOString(),
        },
      });
       // Refresh the page after 3 seconds
    setTimeout(() => {
      window.location.reload();
    }, 3000);
      
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send broadcast");
    }
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
      callBack: () => setIsBroadcastModalVisible(true), // Show broadcast modal
    },
    {
      name: "Logout",
      callBack: async () => {
        setIsContextMenuVisible(false);
        router.push("/logout");
      },
    },
  ];

  const handleAllContactsPage = () => {
    dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
  };

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
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Enter your message here"
              rows="4"
            ></textarea>
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
