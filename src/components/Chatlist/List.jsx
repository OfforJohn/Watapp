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
    let intervalId = null;
    let stopPollingTimeoutId = null;
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
      if (intervalId || hasStoppedPolling) return; // Prevent stacking

      intervalId = setInterval(() => {
        if (!document.hidden) {
          getContacts();
        }
      }, 10000); // 10 secondsaaaaaaaaaaaaaa

      stopPollingTimeoutId = setTimeout(() => {
        clearInterval(intervalId);
        intervalId = null;
        hasStoppedPolling = true;
        console.log("⏱️ Polling stopped after 30 minutes");
      }, 19 * 60 * 1000); // 30 minutes
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } else if (!hasStoppedPolling && !intervalId) {
        getContacts();
        startPolling();
      }
    };

    if (userInfo?.id) {
      getContacts(); // Initial fetch
      startPolling(); // Begin polling
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (stopPollingTimeoutId) clearTimeout(stopPollingTimeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      intervalId = null;
      stopPollingTimeoutId = null;
    };
  }, [userInfo]);

  return (
    <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar">
      {filteredContacts && filteredContacts.length > 0
        ? filteredContacts.map((contact) => (
            <ChatLIstItem data={contact} key={contact.id} />
          ))
        : userContacts.map((contact) => (
            <ChatLIstItem data={contact} key={contact.id} />
          ))}
    </div>
  );
}
