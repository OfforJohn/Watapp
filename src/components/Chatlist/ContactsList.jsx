import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { GET_ALL_CONTACTS } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { SEARCH_USERS_ROUTE } from "@/utils/ApiRoutes";
import { BiArrowBack, BiSearchAlt2 } from "react-icons/bi";
import ChatLIstItem from "./ChatLIstItem";

function ContactsList() {
  const [{ userInfo }, dispatch] = useStateProvider();
  const [allContacts, setAllContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [remoteResults, setRemoteResults] = useState(null);

  const copyUserId = async () => {
    if (!userInfo?.handle || !navigator.clipboard) return;
    await navigator.clipboard.writeText(`@${userInfo.handle}`);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1500);
  };

  const groupedContacts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return (remoteResults || allContacts)
      .filter((contact) => Number(contact.id) !== Number(userInfo?.id))
      .filter((contact) => {
        if (!query) return true;
        return [contact.name, contact.handle, contact.phoneNumber]
          .some((value) => String(value || "").toLowerCase().includes(query));
      })
      .reduce((groups, contact) => {
        const initial = contact.name?.trim()?.[0]?.toUpperCase() || "#";
        if (!groups[initial]) groups[initial] = [];
        groups[initial].push(contact);
        return groups;
      }, {});
  }, [allContacts, remoteResults, searchTerm, userInfo?.id]);

  useEffect(() => {
    const getContacts = async () => {
      try {
        const {
          data: { users },
        } = await axios.get(GET_ALL_CONTACTS);

        setAllContacts(Object.values(users || {}).flat());
      } catch (err) {
        console.error("Failed to load the user directory:", err);
        setLoadError("Could not load users. Check that the local server is running.");
      } finally {
        setLoading(false);
      }
    };
    getContacts();
  }, []);

  useEffect(() => {
    const query = searchTerm.trim().replace(/^@/, "");
    if (!query) {
      setRemoteResults(null);
      return;
    }
    if (query.length < 2) {
      setRemoteResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const { data } = await axios.get(SEARCH_USERS_ROUTE, {
          params: { q: query },
          signal: controller.signal,
        });
        setRemoteResults(data.users || []);
      } catch (error) {
        if (error.code !== "ERR_CANCELED") {
          console.error("Failed to search users:", error);
          setRemoteResults([]);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchTerm]);

  return (
    <div className="h-full flex flex-col">
      <div className="h-24 flex items-end px-3 py-4">
        <div className="flex w-full flex-col gap-3 text-white">
          <div className="flex items-center gap-8">
            <BiArrowBack
              className="cursor-pointer text-xl"
              onClick={() =>
                dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE })
              }
            />
            <span className="pl-4">New Chat</span>
          </div>
          <div className="flex items-center gap-2 pl-1 text-xs text-secondary">
            <span>Your username: {userInfo?.handle ? `@${userInfo.handle}` : "…"}</span>
            <button
              className="text-teal-light hover:underline"
              onClick={copyUserId}
              type="button"
              disabled={!userInfo?.handle}
            >
              {copiedId ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
      <div className="bg-search-input-container-background h-full pl-14 flex-auto overflow-auto custom-scrollbar">
        <div className="flex py-3 px-4 items-center gap-3 h-14">
          <div className="bg-panel-header-background flex items-center gap-5 px-3 py-1 rounded-lg flex-grow">
            <div className="">
              <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-l" />
            </div>
            <div className="">
              <input
                type="text"
                placeholder="Search by @username, name, or phone number"
                className="bg-transparent text-sm focus:outline-none text-white w-full"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
            </div>
          </div>
        </div>
        {loading && <p className="px-6 py-4 text-sm text-secondary">Loading people…</p>}
        {!loading && loadError && <p className="px-6 py-4 text-sm text-red-300">{loadError}</p>}
        {!loading && !loadError && Object.keys(groupedContacts).length === 0 && (
          <p className="px-6 py-4 text-sm text-secondary">
            {searchTerm ? "No users match that search." : "No other users are available yet."}
          </p>
        )}
        {Object.entries(groupedContacts).map(([initialLetter, userList]) => {
          return (
            <div key={initialLetter}>
              <div className="text-teal-light pl-14 py-5">{initialLetter}</div>
              {userList.map((contact) => {
                return (
                   <div key={contact.id}>
                  <ChatLIstItem
                    data={contact}
                    isContactPage={true}
                  />
               
                </div>
                );
                  
              })}
                
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ContactsList;
