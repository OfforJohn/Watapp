import { useStateProvider } from "@/context/StateContext";
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { BiSearchAlt2 } from "react-icons/bi";
import { reducerCases } from "@/context/constants";
import { calculateTime } from "@/utils/CalculateTime";

function SearchMessages() {
  const [{ currentChatUser, messages }, dispatch] = useStateProvider();
  const [searchBarFocus, setSearchBarFocus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedMessages, setSearchedMessages] = useState([]);

  useEffect(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      setSearchedMessages([]);
      return;
    }

    setSearchedMessages(
      messages.filter(
        (message) =>
          message.type === "text" &&
          message.message?.toLowerCase().includes(query)
      )
    );
  }, [searchTerm, messages]);

  return (
    <div className="border-conversation-border border-l w-full bg-conversation-panel-background flex flex-col z-10 max-h-screen">
      <div className="h-16 px-4 py-5 flex gap-6 items-center bg-panel-header-background text-primary-strong">
        <button
          type="button"
          aria-label="Close message search"
          onClick={() => dispatch({ type: reducerCases.SET_MESSAGES_SEARCH })}
        >
          <IoClose className="cursor-pointer text-icon-lighter text-2xl" />
        </button>
        <span>Search Messages</span>
      </div>

      <div className="overflow-auto custom-scrollbar h-full">
        <div className="flex items-center flex-col w-full">
          <div className="flex px-5 items-center gap-3 h-14 w-full">
            <div className="bg-panel-header-background flex items-center gap-3 px-3 py-[6px] rounded-lg flex-grow">
              <BiSearchAlt2 className="text-panel-header-icon text-lg" />
              <input
                type="search"
                placeholder="Search messages"
                className="bg-transparent text-sm focus:outline-none text-white w-full"
                onFocus={() => setSearchBarFocus(true)}
                onBlur={() => setSearchBarFocus(false)}
                onChange={(event) => setSearchTerm(event.target.value)}
                value={searchTerm}
                aria-label="Search messages in this conversation"
              />
              {searchBarFocus && searchTerm && (
                <button
                  type="button"
                  className="text-icon-lighter"
                  aria-label="Clear search"
                  onClick={() => setSearchTerm("")}
                >
                  <IoClose />
                </button>
              )}
            </div>
          </div>

          {!searchTerm.length && (
            <span className="mt-10 text-secondary">
              Search for messages with {currentChatUser?.name || "this contact"}
            </span>
          )}
        </div>

        <div className="flex justify-center h-full flex-col">
          {searchTerm.length > 0 && !searchedMessages.length && (
            <span className="text-secondary w-full flex justify-center py-6">
              No messages found
            </span>
          )}
          <div className="flex flex-col w-full">
            {searchedMessages.map((message) => (
              <div
                key={message.id}
                className="flex cursor-pointer flex-col justify-center hover:bg-background-default-hover w-full px-5 border-b-[0.1px] border-secondary py-5"
              >
                <div className="text-sm text-secondary">
                  {calculateTime(message.createdAt)}
                </div>
                <div className="text-icon-green">{message.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchMessages;