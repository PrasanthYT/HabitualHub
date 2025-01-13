import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Octokit } from "@octokit/rest";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import api from "../utils/api";

function GitGoals() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("_token");

  // States
  const [repos, setRepos] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [getGithubToken, setGetGithubToken] = useState(null);
  const [goalForm, setGoalForm] = useState({
    repoId: "",
    repoName: "",
    goalName: "",
    description: "",
    dueDate: "",
  });

  useEffect(() => {
    // Get and decode token when component mounts
    const token = sessionStorage.getItem("_token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.user.id);
    }
  }, []);

  // Fetch GitHub token when component mounts
  useEffect(() => {
    const fetchGitHubToken = async () => {
      try {
        const response = await api.get(`/auth/github/token/${userId}`);
        if (response.data.success && response.data.githubToken) {
          setGetGithubToken(response.data.githubToken);
        } else {
          toast.error("GitHub token not found.");
        }
      } catch (error) {
        toast.error("An error occurred while fetching the token.");
        console.error(error);
      }
    };

    if (userId) {
      fetchGitHubToken();
    }
  }, [userId]);

  // Initialize Octokit & Fetch Repo
  useEffect(() => {
    if (getGithubToken) {
      // Initialize Octokit with GitHub token
      const octokit = new Octokit({ auth: getGithubToken });

      const fetchRepos = async () => {
        try {
          const { data } = await octokit.repos.listForAuthenticatedUser();
          console.log("Fetched Repositories:", data);
          setRepos(data);
        } catch (error) {
          console.error("GitHub API error:", error);
          toast.error("Failed to fetch repositories");
        }
      };

      fetchRepos();
    }
  }, [getGithubToken]);

  // Fetch goals
  const fetchGoals = async () => {
    try {
      const response = await api.get("/git");
      setGoals(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
      if (error.response?.status === 401) {
        navigate("/auth/signin");
      }
      toast.error("Failed to fetch goals");
    }
  };

  // Submit goal
  // Update handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!goalForm.repoId || !goalForm.goalName || !goalForm.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const goalData = {
        repoId: goalForm.repoId,
        repoName: goalForm.repoName,
        goalName: goalForm.goalName,
        description: goalForm.description || "",
        dueDate: new Date(goalForm.dueDate).toISOString(),
      };

      if (isEditMode) {
        const response = await api.put(`/git/${goalForm._id}`, goalData);
        setGoals(
          goals.map((goal) =>
            goal._id === goalForm._id ? response.data : goal
          )
        );
        toast.success("Goal updated successfully");
      } else {
        const response = await api.post("/git", goalData);
        setGoals((prevGoals) => [...prevGoals, response.data]);
        toast.success("Goal created successfully");
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Submit error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to save goal");
    } finally {
      setLoading(false);
    }
  };

  // Update form state
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGoalForm((prev) => ({
      ...prev,
      [name]: value,
      repoName:
        name === "repoId"
          ? repos.find((r) => r.id.toString() === value)?.name || ""
          : prev.repoName,
    }));
  };

  // Delete goal
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/git/${id}`);
      if (response.data.success) {
        setGoals(goals.filter((goal) => goal._id !== id));
        toast.success("Goal deleted successfully");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete goal");
    }
  };

  // Initialize data
  useEffect(() => {
    if (!token) {
      navigate("/auth/signin");
      return;
    }

    const initialize = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchGoals()]);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [token]);

  // Reset form
  const resetForm = () => {
    setGoalForm({
      repoId: "",
      repoName: "",
      goalName: "",
      description: "",
      dueDate: "",
    });
    setIsEditMode(false);
  };

  // Add these functions to GitGoals component
  const groupGoalsByRepo = () => {
    if (!goals?.length) return [];

    return goals.reduce((acc, goal) => {
      const repoId = goal.repoId?.toString();
      if (!acc[repoId]) {
        acc[repoId] = [];
      }
      acc[repoId].push(goal);
      return acc;
    }, {});
  };

  const handleStatusChange = async (id) => {
    try {
      const goal = goals.find((g) => g._id === id);
      if (!goal) {
        toast.error("Goal not found");
        return;
      }

      const newStatus = goal.status === "completed" ? "pending" : "completed";

      const response = await api.put(`/git/${id}`, {
        status: newStatus,
        completedAt:
          newStatus === "completed" ? new Date().toISOString() : null,
      });

      if (response.data) {
        setGoals((prevGoals) =>
          prevGoals.map((g) => (g._id === id ? response.data : g))
        );
        toast.success(
          `Goal ${newStatus === "completed" ? "completed" : "reopened"}`
        );
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update goal status");
    }
  };

  const handleEdit = (goal) => {
    setGoalForm({
      _id: goal._id,
      repoId: goal.repoId,
      repoName: goal.repoName,
      goalName: goal.goalName,
      description: goal.description,
      dueDate: new Date(goal.dueDate).toISOString().split("T")[0],
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const openAddGoalModal = (repoId = null) => {
    // Reset form state
    setGoalForm({
      repoId: repoId || "",
      repoName: "",
      goalName: "",
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
    });

    // If repoId is provided, set repo name
    if (repoId) {
      const selectedRepo = repos.find(
        (repo) => repo.id.toString() === repoId.toString()
      );
      if (selectedRepo) {
        setGoalForm((prev) => ({
          ...prev,
          repoId,
          repoName: selectedRepo.name,
        }));
      }
    }

    // Reset edit mode and open modal
    setIsEditMode(false);
    setIsModalOpen(true);
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
      <main className="md:ml-64 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-14 md:mt-0">
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tight mb-4">
                  Git Goals
                </h1>
                <p className="text-lg text-blue-100 leading-relaxed">
                  Transform your GitHub repositories into achievable milestones.
                  Set smart goals, track your progress, and celebrate your
                  development journey — one commit at a time.
                </p>
                <div className="mt-6 flex items-center space-x-4">
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
                    <span className="ml-2 text-blue-100">Set Clear Goals</span>
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
                    <span className="ml-2 text-blue-100">Track Progress</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-blue-200"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L13.586 6H10a1 1 0 110-2h3.586l-1.293-1.293A1 1 0 0112 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-blue-100">Achieve More</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Goals Timeline Section */}
            <div className="bg-white shadow-lg rounded-2xl p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Repository Goals
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Track your development milestones
                  </p>
                </div>
                <button
                  onClick={openAddGoalModal}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md flex items-center gap-2"
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
                  Add New Goal
                </button>
              </div>

              {isModalOpen && (
                <div className="fixed inset-0 min-h-screen bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                    <div className="flex justify-between items-center p-4 border-b">
                      <h3 className="text-lg font-semibold">
                        {isEditMode ? "Edit Goal" : "Add New Goal"}
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
                            Select Repository
                          </label>
                          <select
                            name="repoId"
                            value={goalForm.repoId}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Choose a repository</option>
                            {repos.map((repo) => (
                              <option key={repo.id} value={repo.id}>
                                {repo.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Goal Name
                          </label>
                          <input
                            type="text"
                            name="goalName"
                            value={goalForm.goalName}
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
                            value={goalForm.description}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows="3"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Due Date
                          </label>
                          <input
                            type="date"
                            name="dueDate"
                            value={goalForm.dueDate}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          />
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
                          disabled={loading}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          {loading
                            ? "Saving..."
                            : isEditMode
                            ? "Update Goal"
                            : "Create Goal"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* // Update render section */}
              {Object.entries(groupGoalsByRepo()).map(([repoId, repoGoals]) => {
                const repo = repos.find((r) => r.id.toString() === repoId);

                return repo && Array.isArray(repoGoals) ? (
                  <div key={repoId} className="mb-12 last:mb-0">
                    <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {repo.name || "Unknown Repository"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Active goals: {repoGoals.length}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6 pl-6">
                      {repoGoals.map((goal) => (
                        <div
                          key={goal.id}
                          className="relative pl-8 border-l-2 border-blue-500 transition-all duration-200 hover:border-blue-600"
                        >
                          <div className="absolute -left-3 top-2">
                            <div
                              className={`w-6 h-6 rounded-full border-4 ${
                                goal.status === "completed"
                                  ? "border-green-500 bg-green-100"
                                  : "border-blue-500 bg-white"
                              } transition-colors duration-200 shadow-sm`}
                            ></div>
                          </div>

                          <div
                            className={`bg-white rounded-xl p-6 shadow-sm border ${
                              goal.status === "completed"
                                ? "border-green-100 bg-green-50/30"
                                : "border-gray-100 hover:border-blue-100"
                            } transition-all duration-200`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4
                                className={`text-lg font-medium ${
                                  goal.status === "completed"
                                    ? "text-gray-500 line-through"
                                    : "text-gray-900"
                                }`}
                              >
                                {goal.goalName}
                              </h4>
                              <div className="flex items-center gap-4">
                                <input
                                  type="checkbox"
                                  checked={goal?.status === "completed"}
                                  onChange={() => handleStatusChange(goal._id)}
                                  className="w-5 h-5 text-green-600 rounded-full border-gray-300 focus:ring-green-500 transition-colors duration-200"
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEdit(goal)}
                                    disabled={goal.status === "completed"}
                                    className={`p-1.5 rounded-lg transition-colors duration-200 ${
                                      goal.status === "completed"
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-blue-600 hover:bg-blue-50"
                                    }`}
                                  >
                                    <svg
                                      className="w-4 h-4"
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
                                  </button>
                                  <button
                                    onClick={() => handleDelete(goal._id)}
                                    disabled={goal.status === "completed"}
                                    className={`p-1.5 rounded-lg transition-colors duration-200 ${
                                      goal.status === "completed"
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-red-600 hover:bg-red-50"
                                    }`}
                                  >
                                    <svg
                                      className="w-4 h-4"
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
                                  </button>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-4">
                              {goal.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                Due:{" "}
                                {new Date(goal.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })}
            </div>

            <div className="bg-white shadow-lg rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Repositories
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage your GitHub repositories and track progress
                  </p>
                </div>
              </div>

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
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <svg
                    className="w-12 h-12 text-red-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {repos.map((repo) => (
                    <div
                      key={repo.id}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg text-gray-900 w-full text-ellipsis overflow-hidden">
                          {repo.name}
                        </h3>
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                          {repo.visibility}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {repo.description || "No description available"}
                      </p>

                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {repo.stargazers_count}
                          </span>
                          <span className="flex items-center">
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
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                              />
                            </svg>
                            {repo.forks_count}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          Updated{" "}
                          {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GitGoals;
