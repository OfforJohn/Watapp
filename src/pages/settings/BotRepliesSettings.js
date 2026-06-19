import { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiEdit3, FiCheck, FiX } from "react-icons/fi";

export default function BotRepliesSettings() {
  const [replyInput, setReplyInput] = useState("");
  const [replies, setReplies] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [botCount, setBotCount] = useState(1);
  const [delays, setDelays] = useState({}); // 🆕 Manage delay per bot in state

  // Load bot count from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("botCount");
      if (saved) {
        setBotCount(parseInt(saved, 10));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("botCount", botCount.toString());
    }
  }, [botCount]);

  // Fetch the replies and their delays from localStorage
  const fetchReplies = async () => {
    try {
      const res = await axios.get("https://render-backend1-a38s.onrender.com/api/auth/get-replies");
      const replies = res.data.replies || [];
      setReplies(replies);

      // 🧠 Load delays from localStorage
      const delayObj = {};
      replies.forEach((r) => {
        const delay = localStorage.getItem(`delay_${r.id}`);
        if (delay !== null) {
          delayObj[r.id] = parseInt(delay, 10) / 1000; // Convert ms to sec
        } else {
          delayObj[r.id] = 0; // If no delay, set to 0
        }
      });
      setDelays(delayObj);
    } catch (err) {
      console.error("Failed to fetch replies", err);
      setError("Failed to load replies.");
    }
  };

  const handleAdd = async () => {
    if (!replyInput.trim()) return;
    setLoading(true);
    try {
      await axios.post("https://render-backend1-a38s.onrender.com/api/auth/add-reply", {
        content: replyInput,
      });
      setMessage("✅ Reply added!");
      setReplyInput("");
      fetchReplies();
    } catch {
      setError("❌ Failed to add reply.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

const handleDelete = async (id) => {
  try {
    await axios.delete(`https://render-backend1-a38s.onrender.com/api/auth/delete-reply/${id}`);

    // Remove the delay for the deleted reply
    localStorage.removeItem(`delay_${id}`);

    // Optional: Remove all other delay entries if you want a full cleanup
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("delay_")) {
        localStorage.removeItem(key);
      }
    });

    fetchReplies();
  } catch {
    setError("❌ Failed to delete reply.");
  }
};


  const handleEdit = async (id) => {
    try {
      await axios.put(`https://render-backend1-a38s.onrender.com/api/auth/update-reply/${id}`, {
        content: editContent,
      });
      setEditId(null);
      fetchReplies();
    } catch {
      setError("❌ Failed to update reply.");
    }
  };

  // Handle delay change and sync with localStorage
const handleDelayChange = (id, seconds) => {
  const updated = { ...delays, [id]: seconds };
  setDelays(updated);
  localStorage.setItem(`delay_${id}`, (seconds * 1000).toString()); // save in ms
};


  const handleResetAllDelays = () => {
    const cleared = {};
    replies.forEach((r) => {
      cleared[r.id] = 0;
      localStorage.removeItem(`delay_${r.id}`);
    });
    setDelays(cleared);
  };
  

  useEffect(() => {
    fetchReplies();
  }, []);

  const handleKillDelayStorage = () => {
  try {
    // remove every delay_* key in localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("delay_")) {
        localStorage.removeItem(key);
      }
    });

    // reflect in UI: set all current delays to 0
    setDelays((prev) => {
      const cleared = {};
      Object.keys(prev).forEach((id) => (cleared[id] = 0));
      return cleared;
    });

    setMessage("🗑️ Cleared allkeys from localStorage");
    setTimeout(() => setMessage(""), 2000);
  } catch {
    setError("❌ Could not clear delay_* keys");
    setTimeout(() => setError(""), 2000);
  }
};

const handleResetAndKill = () => {
  handleResetAllDelays();   // clears the state delays
  handleKillDelayStorage(); // removes from localStorage
};



  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mt-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">🤖 Manage Bot Replies</h2>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500"
          placeholder="Enter new bot reply..."
          value={replyInput}
          onChange={(e) => setReplyInput(e.target.value)}
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      {/* 🔢 Bot Count Input */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <label className="text-sm text-gray-700 font-medium">
          Number of Bot Replies to Use:
        </label>
        <input
          type="number"
          min="1"
          max={replies.length || 1}
          value={botCount}
          onChange={(e) => setBotCount(parseInt(e.target.value, 10))}
          className="w-32 px-3 py-2 border border-gray-300 rounded-md"
        />
        <span className="text-xs text-gray-500 mt-1 sm:mt-0">(Max: {replies.length})</span>
      </div>

      {/* Reset Button */}
<div className="flex justify-end">
  <button
    onClick={handleResetAndKill}
    className="flex items-center gap-2 px-5 py-2.5 
               rounded-full bg-blue-500 text-white text-sm font-medium
               hover:bg-blue-600 active:bg-blue-700
               transition-all duration-200 shadow-md"
  >
    🔄 Reset Replies
  </button>
</div>




      {message && <p className="text-green-600">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}

      <h3 className="text-sm font-semibold text-gray-700">📜 Existing Replies:</h3>
      <div className="space-y-2">
        {replies.map((r) => (
          <div
            key={r.id}
            className="flex justify-between items-center border px-4 py-2 rounded-md bg-gray-50"
          >
            {editId === r.id ? (
              <>
                <input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1 text-sm px-2 py-1 border rounded"
                />
                <div className="flex space-x-2 ml-2">
                  <button onClick={() => handleEdit(r.id)} className="text-green-600">
                    <FiCheck />
                  </button>
                  <button onClick={() => setEditId(null)} className="text-gray-600">
                    <FiX />
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-800">{r.content}</span>
                <div className="flex items-center space-x-3 text-lg">
                  <button
                    onClick={() => {
                      setEditId(r.id);
                      setEditContent(r.content);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FiEdit3 />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 />
                  </button>
                 

<input
  type="number"
  className="w-20 px-1 py-1 text-xs border rounded-md"
  placeholder="Delay (sec)"
  value={delays[r.id] ?? 0}   // ✅ always pull by reply ID
  onChange={(e) =>
    handleDelayChange(r.id, parseInt(e.target.value || "0", 10))
  }
/>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}