import React, { useState } from "react";
import { BsFillChatLeftTextFill, BsThreeDotsVertical } from "react-icons/bs";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { useRouter } from "next/router";
import * as faceapi from 'face-api.js';
import ContextMenu from "../common/ContextMenu";
import axios from "axios";
import { toast } from "react-toastify";

import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import { useRef, useEffect } from "react";



import "react-toastify/dist/ReactToastify.css";

export default function ChatListHeader() {
  const [{ userInfo }, dispatch] = useStateProvider();
  const [genderResults, setGenderResults] = useState([]);
  const router = useRouter();

  const [contextMenuCordinates, setContextMenuCordinates] = useState({ x: 0, y: 0 });
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);

  const [isBroadcastModalVisible, setIsBroadcastModalVisible] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");


  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [selectedGender, setSelectedGender] = useState("male");
  const [previewNumbers, setPreviewNumbers] = useState([]);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [sending, setSending] = useState(false);

  const [validationResults, setValidationResults] = useState([]); // For storing WhatsApp validation results
  const [isValidationModalVisible, setIsValidationModalVisible] = useState(false);



  const refetchContacts = async () => {
    try {
      const {
        data: { users, onlineUsers },
      } = await axios.get(`${GET_INITIAL_CONTACTS_ROUTE}/${userInfo.id}`);
      dispatch({ type: reducerCases.SET_USER_CONTACTS, userContacts: users });
      dispatch({ type: reducerCases.SET_ONLINE_USERS, onlineUsers });
    } catch (err) {
      console.error("❌ Failed to refresh contacts:", err);
    }
  };

  const pollIntervalRef = useRef(null);

  const handleBroadcastToAll = async () => {
    if (sending) return;

    if (!broadcastMessage.trim()) {
      toast.error("Please enter a message to broadcast.");
      return;
    }

    // ✅ Clear any existing interval first
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
      console.log("⛔ Cleared existing polling interval");
    }

    try {
      setSending(true);

      const userId = parseInt(localStorage.getItem("userId"));
      const latestBotCount = parseInt(localStorage.getItem("botCount") || "1", 10);
      const numberCount = parseInt(localStorage.getItem("importedNumberCount") || "0", 10);

      let pollCount = 0;
      let pollInterval = 5000;
      let maxPollCount = 250;

      if (numberCount > 2500) {
        pollInterval = 4800;
        maxPollCount = 450;
      } else if (numberCount > 1000) {
        pollInterval = 4800;
        maxPollCount = 240;
      } else if (numberCount > 500) {
        pollInterval = 5000;
        maxPollCount = 240;
      }


      console.log(`Polling set for ${maxPollCount} times with ${pollInterval}ms interval`);

      // ✅ Start polling and save the interval ID in ref
      pollIntervalRef.current = setInterval(async () => {
        try {
          const {
            data: { users, onlineUsers },
          } = await axios.get(`${GET_INITIAL_CONTACTS_ROUTE}/${userId}`);
          dispatch({ type: reducerCases.SET_USER_CONTACTS, userContacts: users });
          dispatch({ type: reducerCases.SET_ONLINE_USERS, onlineUsers });
          console.log(`📡 Polling #${pollCount + 1}...`);
        } catch (err) {
          console.error("Polling error:", err);
        }

        pollCount++;

        // ✅ Give 4 extra polls before stopping
        if (pollCount >= maxPollCount + 4) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          console.log("✅ Finished polling (including 4 grace polls).");
        }
      }, pollInterval);


      // Gather all delays from localStorage in numeric order
      const delays = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("delay_")) {
          delays.push({ key, value: parseInt(localStorage.getItem(key), 10) });
        }
      }

      // Sort by numeric part of the key
      delays.sort((a, b) => {
        const numA = parseInt(a.key.split("_")[1], 10);
        const numB = parseInt(b.key.split("_")[1], 10);
        return numA - numB;
      });

      const botDelaysOrdered = delays.map(d => d.value);

      console.log("🚀 Sending with ordered bot delays:", botDelaysOrdered);

      await axios.post("https://render-backend-ksnp.onrender.com/api/auth/message/broadcast", {
        message: broadcastMessage,
        senderId: userId,
        botCount: latestBotCount,
        botDelays: botDelaysOrdered
      });

      // ✅ Stop polling after successful broadcast (with 4s delay)
      setTimeout(() => {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        console.log("🛑 Polling stopped after broadcast (delayed 4s)");
      }, 4000); // 4000ms = 4 seconds


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
        .filter((line) => line) // remove empty lines
        .map((line) => {
          let name, number;

          // Detect delimiter: comma or semicolon
          const delimiter = line.includes(",") ? "," : line.includes(";") ? ";" : null;

          if (delimiter) {
            const parts = line.split(delimiter).map((item) => item.trim());
            name = parts[0];
            number = parts[1];
          } else {
            // Only number, no name provided
            number = line;
            name = number;
          }

          // Validate number
          if (!/^\+?\d{10,}$/.test(number)) return null;

          const randomIndex = Math.floor(Math.random() * 1000) + 1;
          const avatar = `/avatars/${selectedGender}/${randomIndex}.png`;

          return { number, name, avatar };
        })
        .filter(Boolean); // remove invalid entries

      const numberCount = contacts.length;
      console.log("Total valid contacts:", numberCount);
      localStorage.setItem("importedNumberCount", numberCount);

      if (!contacts.length) {
        toast.error("No valid contacts found.");
        return;
      }

      setPreviewNumbers(contacts);
      setIsPreviewVisible(true);
    };

    reader.readAsText(file);
  };

  const generateDefaultContacts = (closeModal = false) => {
    const totalImages = 1000; // number of images you have
    const contacts = Array.from({ length: 1000 }, (_, i) => {
      const number = `+1000000${String(i + 1).padStart(4, "0")}`; // dummy numbers
      const name = `User ${i + 1}`;
      const avatarIndex = (i % totalImages) + 1; // cycles 1–1000
      const avatar = `/avatars/default/${avatarIndex}.png`; // local path

      return { number, name, avatar };
    });

    // ✅ update state first
    setPreviewNumbers(contacts);
    setIsPreviewVisible(true);

    // ✅ then save count
    localStorage.setItem("importedNumberCount", contacts.length);

    // ✅ optionally close import modal
    if (closeModal) setIsImportModalVisible(false);
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

      const res = await axios.post("https://render-backend-ksnp.onrender.com/api/auth/add-batch-users", {
        startingId: 3,
        contacts: payload,
      });

      toast.success(res.data.message || "Users imported successfully");

      await refetchContacts();
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


      await refetchContacts();
      setIsContextMenuVisible(false);
      const startId = 3;
      const res = await axios.delete(`https://render-backend-ksnp.onrender.com/api/auth/delete-batch-users/${startId}`);
      toast.success(res.data.message || "Users deleted successfully");

      await refetchContacts();
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
      name: "Check WhatsApp Numbers", // New Option for CSV Upload
      callBack: () => document.getElementById("whatsapp-csv-upload").click(),
    },

    {
      name: "Open Validation Modal",
      callBack: () => {
        setIsValidationModalVisible(true);
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

  useEffect(() => {
    if (validationResults.length > 0) {
      setIsValidationModalVisible(true);
    }
  }, [validationResults]);

  const handleWhatsAppValidation = async (phoneNumbers) => {
    const chunkSize = 10;
    setValidationResults([]);
    let allResults = [];

    for (let i = 0; i < phoneNumbers.length; i += chunkSize) {
      const chunk = phoneNumbers.slice(i, i + chunkSize);

      try {
        const response = await axios.post(
          "https://render-backend-ksnp.onrender.com/api/validate-whatsapp-profiles",
          { phone_numbers: chunk }
        );

        const mergedResults = response.data;
        allResults = [...allResults, ...mergedResults];
        setValidationResults((prev) => [...prev, ...mergedResults]);

        console.log(`Batch ${i / chunkSize + 1} merged:`, mergedResults);
      } catch (err) {
        console.error(`Batch ${i / chunkSize + 1} failed:`, err);
        toast.error(`Batch ${i / chunkSize + 1} failed.`);
      }
    }

    if (allResults.length > 0) setIsValidationModalVisible(true);
    toast.success("WhatsApp validation completed with profiles.");
  };
useEffect(() => {
  const runGenderDetection = async () => {
    if (!validationResults.length) return;

    try {
      await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
      await faceapi.nets.ageGenderNet.loadFromUri("/models");
      console.log("face-api models loaded");
    } catch (err) {
      console.error("Error loading face-api models:", err);
      return;
    }

    for (const result of validationResults) {
    const imageUrl =
  result?.profileRaw?.data?.head_image ||
  result?.profileRaw?.profilePic ||
  result?.profileRaw?.urlImage ||
  result?.avatar ||
  null;

      if (!imageUrl) continue;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      img.onload = async () => {
        try {
          const detection = await faceapi
            .detectSingleFace(img)
            .withAgeAndGender();

          if (detection) {
            const { gender, age } = detection;

            setGenderResults((prev) => [
              ...prev,
              {
                phone_number: result.phone_number,
                gender,
                age: Math.round(age),
              },
            ]);
          } else {
            console.warn(`No face detected for ${result.phone_number}`);
          }
        } catch (err) {
          console.error(`Detection failed for ${result.phone_number}:`, err);
        }
      };

      img.onerror = (err) => {
        console.error(`Image failed to load for ${result.phone_number}:`, err);
      };
    }
  };

  runGenderDetection();
}, [validationResults]);






  // Handle CSV Upload for WhatsApp Validation
 const handleCSVUploadForValidation = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const text = e.target.result;

    const phoneNumbers = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
      .map((line) => {
        const parts = line.split(",");
        const raw = parts[1] ? parts[1].trim() : line.trim();
        return raw.replace(/\D/g, ""); // normalize
      })
      .filter((num) => num.length > 6);

    console.log("Normalized Phone Numbers: ", phoneNumbers);

    setValidationResults([]);
    setGenderResults([]);

    // Run validation
    await handleWhatsAppValidation(phoneNumbers);
  };

  reader.readAsText(file);
};


  // This function will be used to show the modal
  const openValidationModal = () => {
    setIsValidationModalVisible(true);
  };
  // This function will be used to close the modal
  const closeValidationModal = () => {
    setIsValidationModalVisible(false);
  };
const getGenderForNumber = (phone_number) => {
  const match = genderResults.find((g) => g.phone_number === phone_number);
  return match ? match.gender : null;
};








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
      {/* WhatsApp CSV Upload input */}
      <input
        id="whatsapp-csv-upload"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleCSVUploadForValidation}
      />
      {/* Validation Results Modal */}


      {isValidationModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg h-[80vh] flex flex-col animate-fadeIn">
            {/* Header */}
            <div className="p-4 border-b">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center">
                WhatsApp Validation Results
              </h2>
            </div>

            {/* Scrollable Results */}
            <div className="flex-1 overflow-y-auto p-4">
              {validationResults.length > 0 ? (
                <ul className="space-y-3">
                  {validationResults.map((result, idx) => (
                  <li
  key={idx}
  className="flex items-center justify-between border-b border-gray-200 pb-2 text-sm sm:text-base"
>
  {/* Avatar + Phone */}
  <div className="flex items-center gap-3 w-[70%]">
    <img
      src={
        result.profileRaw?.data?.head_image ||
    result.profileRaw?.profilePic ||
    result.profileRaw?.urlImage ||
    result.avatar ||
    "/default_avatar.png"
      }
      alt={result.phone_number}
      className="w-10 h-10 rounded-full object-cover border border-gray-300 flex-shrink-0"
    />

   <span className="font-medium text-gray-800 break-all">
  {result.phone_number}
  {getGenderForNumber(result.phone_number) && (
    <span className="ml-2 text-sm text-blue-500 capitalize">
      ({getGenderForNumber(result.phone_number)})
    </span>
  )}
</span>

  </div>

  {/* Status */}
  <span
    className={`font-semibold ${result.status === "valid"
      ? "text-green-500"
      : "text-red-500"
      }`}
  >
    {result.status}
  </span>
</li>

                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center">No validation results yet.</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-4 border-t">
              <button
                onClick={closeValidationModal}
                className="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}






      {/* Import Modal */}
      {isImportModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 transition-opacity">
          <div className="bg-white rounded-2xl shadow-lg w-96 p-6 flex flex-col gap-4 animate-fadeIn">
            <h2 className="text-2xl font-semibold text-gray-800">Import Contacts</h2>
            <p className="text-gray-500 text-sm">Upload a CSV or generate default contacts. Select avatar style.</p>

            <label className="text-sm font-medium text-gray-700">Avatar Gender</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={selectedGender}
              onChange={(e) => {
                const gender = e.target.value;
                setSelectedGender(gender);
                if (gender === "default") generateDefaultContacts(false);
              }}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="animals">Animals</option>
              <option value="default">Default</option>
            </select>

            {/* CSV Upload */}
            {selectedGender !== "default" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Upload CSV</label>
                <input
                  type="file"
                  accept=".csv"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onChange={handleCSVUpload}
                />
              </div>
            )}

            <button onClick={openValidationModal}>View Validation Results</button>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 transition-opacity">
          <div className="bg-white rounded-2xl shadow-lg w-96 p-6 flex flex-col gap-4 animate-fadeIn">
            <h2 className="text-2xl font-semibold text-gray-800">Broadcast Message</h2>

            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Type your message here..."
              rows="4"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />

            <div className="flex justify-between gap-3 mt-2">
              <button
                onClick={handleBroadcastToAll}
                disabled={sending}
                className={`px-4 py-2 rounded-md text-white transition ${sending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                {sending ? "Sending..." : "Send"}
              </button>
              <button
                onClick={() => setIsBroadcastModalVisible(false)}
                className="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 transition-opacity">
          <div className="bg-white rounded-2xl shadow-lg w-96 max-h-[80vh] flex flex-col animate-fadeIn overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Preview Contacts</h2>
              <button
                onClick={() => setIsPreviewVisible(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            <ul className="flex-1 overflow-y-auto p-4 space-y-2">
              {previewNumbers.map((user, idx) => (
                <li key={idx} className="flex items-center gap-3 border-b border-gray-100 pb-2">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-gray-500 text-sm">{user.number}</p>
                  </div>
                </li>
              ))}



            </ul>

            <div className="flex justify-between p-4 border-t border-gray-200">
              <button
                onClick={confirmImportNumbers}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Confirm Import
              </button>
              <button
                onClick={() => setIsPreviewVisible(false)}
                className="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
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