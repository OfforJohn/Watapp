import React, { useState } from "react";
import { BsFillChatLeftTextFill, BsThreeDotsVertical } from "react-icons/bs";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { useRouter } from "next/router";
import ContextMenu from "../common/ContextMenu";
import axios from "axios";
import { toast } from "react-toastify";
import { faker } from "@faker-js/faker";
import "react-toastify/dist/ReactToastify.css";

export default function ChatListHeader() {
  const [{ userInfo }, dispatch] = useStateProvider();
  const router = useRouter();

  const [contextMenuCordinates, setContextMenuCordinates] = useState({ x: 0, y: 0 });
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);

  const [isBroadcastModalVisible, setIsBroadcastModalVisible] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [botCount, setBotCount] = useState(8);

  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [selectedGender, setSelectedGender] = useState("male");
  const [previewNumbers, setPreviewNumbers] = useState([]);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [sending, setSending] = useState(false);


const handleBroadcastToAll = async () => {
  if (sending) return;

  if (!broadcastMessage.trim()) {
    toast.error("Please enter a message to broadcast.");
    return;
  }

  

  try {
    setSending(true);
    const userId = parseInt(localStorage.getItem("userId"));
    const latestBotCount = parseInt(localStorage.getItem("botCount") || "1", 10);
const botStartId = 3; // The first bot starts at ID 3
const botDelays = Array.from({ length: latestBotCount }, (_, i) => {
  const botId = botStartId + i;
  const delay = localStorage.getItem(`delay_${botId}`);
  return parseInt(delay || "0", 10);
});
console.log("🚀 Sending with bot delays:", botDelays);


    // e.g., [10000, 20000, 30000, ...] – each bot waits 10s more than the previous

    await axios.post("https://first-wave-card.glitch.me/api/auth/message/broadcast", {
      message: broadcastMessage,
      senderId: userId,
      botCount: latestBotCount,
      botDelays,
    });

    toast.success("Broadcast sent successfully");
    setBroadcastMessage("");
    setIsBroadcastModalVisible(false);
  } catch (err) {
    console.error("Broadcast error:", err);
  } finally {
    setSending(false);
  }
};





  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCordinates({ x: e.pageX, y: e.pageY });
    setIsContextMenuVisible(true);
  };

  const handleImportUsers = () => {
    setIsContextMenuVisible(false);
    setIsImportModalVisible(true);
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;

      const contacts = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && /^\+?\d{10,}$/.test(line))
      .map((number) => {
        
        const fullName = number; // ✅ Use number as the name
  const randomIndex = Math.floor(Math.random() * 1000) + 1;
  const avatar = `/avatars/${selectedGender}/${randomIndex}.png`;
  return { number, name: fullName, avatar }; // ✅ name is a string
});

      if (!contacts.length) {
        toast.error("No valid phone numbers found.");
        return;
      }

      setPreviewNumbers(contacts);
      setIsPreviewVisible(true);
    };

    reader.readAsText(file);
  };

const confirmImportNumbers = async () => {
  try {
    const payload = previewNumbers.map(({ number, name, avatar }, index) => ({
      email: `bot${index + 1}@fake.com`,   // ✅ dummy email to satisfy schema
      name,
      phoneNumber: number,                 // ✅ mapped properly
      profilePicture: avatar,
      about: "",                           // optional, or use a default
    }));

    const res = await axios.post("https://first-wave-card.glitch.me/api/auth/add-batch-users", {
      startingId: 3,
      contacts: payload,
    });

    toast.success(res.data.message || "Users imported successfully");
    setIsPreviewVisible(false);
    setIsImportModalVisible(false);
    setPreviewNumbers([]);
  } catch (err) {
    console.error("Import error:", err);
    toast.error(err?.response?.data?.message || "Failed to import users");
  }
};



  const handleDeleteAllUsers = async () => {
    try {
      setIsContextMenuVisible(false);
      const startId = 3;
      const res = await axios.delete(`https://first-wave-card.glitch.me/api/auth/delete-batch-users/${startId}`);
      toast.success(res.data.message || "Users deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete users");
    }
  };

  const handleAllContactsPage = () => {
    dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
  };

  const contextMenuOptions = [
    { name: "Import Contacts", callBack: handleImportUsers },
    { name: "Delete All Contacts", callBack: handleDeleteAllUsers },
    {
      name: "Broadcast to All",
      callBack: () => {
        setBroadcastMessage("");
        setIsBroadcastModalVisible(true);
        setIsContextMenuVisible(false);
      },
    },
    {
      name: "Logout",
      callBack: () => {
        setIsContextMenuVisible(false);
        router.push("/logout");
      },
    },
  ];

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center">
      <div className="cursor-pointer font-bold text-white">Chats</div>

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

      {/* Import Modal */}
      {isImportModalVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Import Contacts from CSV</h2>

            <label className="block mb-2 font-medium text-sm">Select Gender for Avatars</label>
            <select
              className="w-full border px-3 py-2 rounded mb-4"
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <input
              type="file"
              accept=".csv"
              className="w-full border px-3 py-2 rounded mb-4"
              onChange={handleCSVUpload}
            />

            <div className="flex justify-end">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setIsImportModalVisible(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {isBroadcastModalVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Broadcast Message to All</h2>

            <label className="block mb-1 text-sm font-medium text-gray-700">Message</label>
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
              placeholder="Enter your message here"
              rows="4"
            />

     

            <div className="flex justify-between mt-2">
              <button
                className={`px-4 py-2 rounded text-white ${sending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"}`}
                onClick={handleBroadcastToAll}
                disabled={sending}
              >
                {sending ? "Sending..." : "Send"}
              </button>

              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setIsBroadcastModalVisible(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Preview Numbers to Import</h2>
            <ul className="mb-4 space-y-2 text-sm">
              {previewNumbers.map((user, idx) => (
                <li key={idx} className="border-b pb-2 flex gap-2 items-center">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-gray-600">{user.number}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between mt-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={confirmImportNumbers}
              >
                Confirm Import
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setIsPreviewVisible(false)}
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
