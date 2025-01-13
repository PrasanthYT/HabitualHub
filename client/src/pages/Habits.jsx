import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import api from "../utils/api";

function Habits() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [habitData, setHabitData] = useState({
    title: "",
    description: "",
    frequency: "daily",
    isCompleted: false,
  });

  console.log(habits)

  // Check authentication on mount
  useEffect(() => {
    const token = sessionStorage.getItem("_token");
    if (!token) {
      navigate("/auth/signin");
    }
  }, [navigate]);

  // Fetch habits
  const fetchHabits = async () => {
    try {
      setLoading(true);
      const response = await api.get("/habits");
      setHabits(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/auth/signin");
      }
      toast.error("Failed to fetch habits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEditMode) {
        const response = await api.put(`/habits/${habitData.id}`, habitData);
        setHabits(
          habits.map((habit) =>
            habit.id === habitData.id ? response.data : habit
          )
        );
        toast.success("Habit updated successfully");
      } else {
        const response = await api.post("/habits", habitData);
        setHabits([...habits, response.data]);
        toast.success("Habit created successfully");
      }
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setHabitData({
      title: "",
      description: "",
      frequency: "daily",
      isCompleted: false,
    });
    setIsModalOpen(false);
    setIsEditMode(false);
  };

  // Handle habit deletion
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/habits/${id}`);
      if (response.data.success) {
        setHabits(habits.filter((habit) => habit._id !== id));
        toast.success("Habit deleted successfully");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete habit");
    }
  };

  // Toggle habit completion
  const toggleHabitCompletion = async (id) => {
    try {
      const response = await api.put(`/habits/${id}/complete`);
      setHabits(
        habits.map((habit) => (habit.id === id ? response.data : habit))
      );
      toast.success(
        response.data.isCompleted
          ? "Habit marked as complete"
          : "Habit marked as incomplete"
      );
    } catch (error) {
      toast.error(
        "Failed to update habit status",
        error.response?.data?.message
      );
    }
  };

  // Handle edit mode
  const handleEdit = (habit) => {
    setIsEditMode(true);
    setHabitData(habit);
    setIsModalOpen(true);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHabitData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle outside clicks for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get formatted date
  const getTodayDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-800 shadow z-50">
        <Navbar />
      </div>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden md:block w-64 bg-gray-800 shadow-md">
        <Navbar />
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-14 md:mt-0">
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div className="max-w-3xl">
                  <h1 className="text-4xl font-extrabold tracking-tight mb-4">
                    Habit Tracker
                  </h1>
                  <p className="text-lg text-blue-100 leading-relaxed">
                    Build better habits, achieve your goals, and transform your
                    daily routine. Track your progress and stay motivated on
                    your journey to self-improvement.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-blue-200"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-2 text-blue-100">Build Habits</span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-blue-200"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-2 text-blue-100">Daily Tracking</span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-blue-200"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm7-1a1 1 0 01.707.293l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L13.586 6H10a1 1 0 110-2h3.586l-1.293-1.293A1 1 0 0112 1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-2 text-blue-100">Stay Motivated</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-6 md:mt-0 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 font-semibold"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Habit
                </button>
              </div>
            </div>
          </div>

          {/* Habits Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div
                className="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
                role="status"
                aria-label="loading"
              >
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-4 text-gray-600">Loading repositories...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {habit.title}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 mt-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                          {habit.frequency}
                        </span>
                      </div>

                      <div className="dropdown-container relative inline-flex">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === habit.id ? null : habit.id
                            )
                          }
                          className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <svg
                            className="w-5 h-5 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </button>

                        {activeDropdown === habit.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 py-1 border border-gray-100">
                            <button
                              onClick={() => handleEdit(habit)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                            >
                              <svg
                                className="w-4 h-4 mr-2 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(habit.id)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <svg
                                className="w-4 h-4 mr-2 text-red-500"
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
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {habit.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">
                            Started{" "}
                            {new Date(habit.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={habit.isCompleted}
                            onChange={() => toggleHabitCompletion(habit.id)}
                            className="sr-only peer"
                          />
                          <div
                            className={`w-5 h-5 border-2 rounded-full transition-colors duration-200 ${
                              habit.isCompleted
                                ? "bg-green-500 border-green-500"
                                : "bg-white border-gray-300 peer-hover:border-blue-500"
                            }`}
                          >
                            {habit.isCompleted && (
                              <svg
                                className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 bg-white shadow-lg rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Completed Habits
                </h2>
                <p className="text-sm text-gray-500 mt-1">{getTodayDate()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits
                .filter((habit) => habit.isCompleted)
                .map((habit) => (
                  <div
                    key={habit.id}
                    className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {habit.title}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                            Completed {new Date(habit.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {habit.description}
                      </p>

                      <div className="mt-auto pt-4 border-t border-green-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Completed{" "}
                            {new Date(habit.updatedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <button
                            onClick={() => toggleHabitCompletion(habit.id)}
                            className="flex items-center text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Undo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-lg font-semibold">
                    {isEditMode ? "Edit Habit" : "Add New Habit"}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Habit Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={habitData.title}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={habitData.description}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Frequency
                      </label>
                      <select
                        name="frequency"
                        value={habitData.frequency}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      {isEditMode ? "Update Habit" : "Add Habit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Habits;
