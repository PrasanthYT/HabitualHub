import React, { useState, useEffect } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Journal() {
  // Form State
  const [journalEntry, setJournalEntry] = useState({
    title: "",
    content: "",
    mood: "neutral",
  });

  // UI States
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  // Fetch Entries
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await api.get("/journal");
      setEntries(response.data);
    } catch (err) {
      toast.error("Failed to fetch entries", err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  // Speech Recognition Setup
  useEffect(() => {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error("Speech recognition not supported");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsRecording(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setJournalEntry((prev) => ({
          ...prev,
          content: prev.content ? `${prev.content} ${transcript}` : transcript,
        }));
      };

      recognition.onend = () => setIsRecording(false);
      recognition.onerror = (event) => {
        if (event.error !== "aborted") {
          toast.error("Speech recognition error");
        }
        setIsRecording(false);
      };

      setRecognitionInstance(recognition);
      return () => recognition.abort();
    } catch (error) {
      console.error("Speech recognition setup error:", error);
    }
  }, []);

  // Handlers
  const handleEditEntry = (entry) => {
    if (!entry) return;
    setIsEditMode(true);
    setSelectedEntry(entry);
    setJournalEntry({
      title: entry.title || "",
      content: entry.content || "",
      mood: entry.mood || "neutral",
    });
    setActiveMenu(null);
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!journalEntry.title || !journalEntry.content) {
      toast.error("Title and content are required");
      return;
    }

    try {
      setLoading(true);
      if (isEditMode && selectedEntry?._id) {
        const response = await api.put(
          `/journal/${selectedEntry._id}`,
          journalEntry
        );
        setEntries(
          entries.map((entry) =>
            entry._id === selectedEntry._id ? response.data : entry
          )
        );
        toast.success("Entry updated successfully!");
      } else {
        const response = await api.post("/journal", journalEntry);
        setEntries([response.data, ...entries]);
        toast.success("Entry saved successfully!");
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      await api.delete(`/journal/${id}`);
      setEntries(entries.filter((entry) => entry._id !== id));
      toast.success("Entry deleted successfully!");
      setActiveMenu(null);
    } catch (err) {
      toast.error("Failed to delete entry", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordClick = () => {
    try {
      if (!recognitionInstance) return;
      if (isRecording) {
        recognitionInstance.stop();
      } else {
        recognitionInstance.start();
      }
    } catch (error) {
      toast.error("Recording failed", error.message);
      setIsRecording(false);
    }
  };

  const resetForm = () => {
    setJournalEntry({ title: "", content: "", mood: "neutral" });
    setIsEditMode(false);
    setSelectedEntry(null);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-800 shadow z-50">
        <Navbar />
      </div>
      <aside className="fixed inset-y-0 left-0 hidden md:block w-64 bg-gray-800 shadow-md">
        <Navbar />
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg mb-6">
            <h1 className="text-2xl md:text-4xl font-extrabold mb-2">
              Journal
            </h1>
            <p className="text-sm md:text-base text-blue-100">
              Document your journey, reflect on your progress
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Entry Form */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? "Edit Journal" : "New Journal"}
                </h2>
                <div className="flex items-center gap-3">
                  <select
                    value={journalEntry.mood}
                    onChange={(e) =>
                      setJournalEntry({ ...journalEntry, mood: e.target.value })
                    }
                    className="text-sm border rounded-lg px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <option value="positive">😊 Positive</option>
                    <option value="neutral">😐 Neutral</option>
                    <option value="negative">😔 Negative</option>
                  </select>
                  <button
                    onClick={handleSaveEntry}
                    disabled={
                      loading || !journalEntry.title || !journalEntry.content
                    }
                    className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2
          ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : !journalEntry.title || !journalEntry.content
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
          } text-white shadow-sm hover:shadow`}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : isEditMode ? (
                      "Update Entry"
                    ) : (
                      "Save Entry"
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Entry Title"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    value={journalEntry.title}
                    onChange={(e) =>
                      setJournalEntry({
                        ...journalEntry,
                        title: e.target.value,
                      })
                    }
                  />
                  <div className="absolute right-3 top-3 text-xs text-gray-400">
                    {journalEntry.title.length}/100
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    className="w-full h-64 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    placeholder="Start writing your journal entry..."
                    value={journalEntry.content}
                    onChange={(e) =>
                      setJournalEntry({
                        ...journalEntry,
                        content: e.target.value,
                      })
                    }
                  />
                  <div className="absolute right-3 bottom-16 text-xs text-gray-400">
                    {journalEntry.content.length} characters
                  </div>
                  <button
                    onClick={handleRecordClick}
                    className={`absolute bottom-4 right-4 p-3 rounded-full transition-all duration-300 flex items-center gap-2
          ${
            isRecording
              ? "bg-red-100 text-red-600 animate-pulse"
              : "bg-blue-100 text-blue-600"
          } hover:bg-opacity-80`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {isRecording ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      )}
                    </svg>
                    {isRecording && (
                      <span className="text-sm">Recording...</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Entries List */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
  {/* Fixed Header */}
  <div className="p-6 border-b border-gray-100">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900">Recent Journals</h2>
      <select className="text-sm border rounded-lg px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors">
        <option>All Entries</option>
        <option>This Week</option>
        <option>This Month</option>
      </select>
    </div>
  </div>

  {/* Scrollable Content */}
  <div className="p-6 h-[calc(100vh-400px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
    <div className="space-y-4">
      {entries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No journal entries yet</p>
        </div>
      ) : (
                  entries.map((entry) => (
                    <div
                      key={entry._id}
                      className="group bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 hover:shadow-md transition-all duration-300 border border-gray-100"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-xl ${
                            entry.mood === "positive"
                              ? "bg-green-50 text-green-600"
                              : entry.mood === "negative"
                              ? "bg-red-50 text-red-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {entry.mood === "positive"
                            ? "😊"
                            : entry.mood === "negative"
                            ? "😔"
                            : "😐"}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {entry.title}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {new Date(entry.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-600 line-clamp-2">
                            {entry.content}
                          </p>
                        </div>

                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenu(
                                activeMenu === entry._id ? null : entry._id
                              )
                            }
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <svg
                              className="w-5 h-5 text-gray-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>

                          {activeMenu === entry._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-50 border border-gray-100">
                              <div className="py-1">
                                <button
                                  onClick={() => handleEditEntry(entry)}
                                  className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 flex items-center group transition-colors"
                                >
                                  <svg
                                    className="w-4 h-4 mr-3 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  <span className="group-hover:text-blue-600 transition-colors">
                                    Edit Entry
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(entry._id)}
                                  className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 flex items-center group transition-colors"
                                >
                                  <svg
                                    className="w-4 h-4 mr-3 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  <span className="group-hover:text-red-600 transition-colors">
                                    Delete Entry
                                  </span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}

export default Journal;
