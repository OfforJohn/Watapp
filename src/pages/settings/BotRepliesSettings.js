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

  const [botCount, setBotCount] = useState(1); // Initialize with default

  // ✅ Safely read botCount from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("botCount");
      if (saved) {
        setBotCount(parseInt(saved, 10));
      }
    }
  }, []);

  // ✅ Save changes to botCount in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("botCount", botCount.toString());
    }
  }, [botCount]);

  const fetchReplies = async () => {
    try {
      const res = await axios.get("https://first-wave-card.glitch.me/api/auth/get-replies");
      setReplies(res.data.replies || []);
    } catch (err) {
      console.error("Failed to fetch replies", err);
      setError("Failed to load replies.");
    }
  };

  const handleAdd = async () => {
    if (!replyInput.trim()) return;
    setLoading(true);
    try {
      await axios.post("https://first-wave-card.glitch.me/api/auth/add-reply", {
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
      await axios.delete(`https://first-wave-card.glitch.me/api/auth/delete-reply/${id}`);
      fetchReplies();
    } catch {
      setError("❌ Failed to delete reply.");
    }
  };

  const handleEdit = async (id) => {
    try {
      await axios.put(`https://first-wave-card.glitch.me/api/auth/update-reply/${id}`, {
        content: editContent,
      });
      setEditId(null);
      fetchReplies();
    } catch {
      setError("❌ Failed to update reply.");
    }
  };

  useEffect(() => {
    fetchReplies();
  }, []);

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
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
