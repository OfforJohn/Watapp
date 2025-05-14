import React, { useEffect } from "react";
import ChatLIstItem from "./ChatLIstItem";
import { useStateProvider } from "@/context/StateContext";
import axios from "axios";
import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";

export default function List() {
  const [{ userInfo, userContacts, filteredContacts }, dispatch] =
    useStateProvider();
    useEffect(() => {
      let intervalId;
      let stopPollingTimeoutId;
      let hasStoppedPolling = false;
    
      const getContacts = async () => {
        try {
          const {
            data: { users, onlineUsers },
          } = await axios.get(`${GET_INITIAL_CONTACTS_ROUTE}/${userInfo.id}`);
          dispatch({ type: reducerCases.SET_USER_CONTACTS, userContacts: users });
          dispatch({ type: reducerCases.SET_ONLINE_USERS, onlineUsers });
        } catch (err) {
          console.error("Failed to fetch contacts:", err);
        }
      };
    
      const startPolling = () => {
        if (hasStoppedPolling) return;
      
        intervalId = setInterval(() => {
          if (!document.hidden) {
            getContacts();
          }
        }, 10000); // still polling every 10s
      
        // Stop polling after 5 seconds (for testing)
        stopPollingTimeoutId = setTimeout(() => {
          clearInterval(intervalId);
          hasStoppedPolling = true;
          console.log("⏱️ Polling stopped after 5 seconds");
        }, 15 * 60 * 1000);
      };
      
      
    
      const handleVisibilityChange = () => {
        if (document.hidden) {
          clearInterval(intervalId); // Pause polling
        } else if (!hasStoppedPolling) {
          getContacts(); // Fetch immediately on return
          startPolling(); // Resume polling if not yet stopped
        }
      };
    
      if (userInfo?.id) {
        getContacts(); // Initial fetch
        startPolling(); // Start polling
        document.addEventListener("visibilitychange", handleVisibilityChange);
      }
    
      return () => {
        clearInterval(intervalId);
        clearTimeout(stopPollingTimeoutId);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }, [userInfo]);
    
  return (
    <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar">
      {filteredContacts && filteredContacts.length > 0
        ? filteredContacts.map((contact) => {
            return <ChatLIstItem data={contact} key={contact.id} />;
          })
        : userContacts.map((contact) => {
            return <ChatLIstItem data={contact} key={contact.id} />;
          })}
    </div>
  );
}
