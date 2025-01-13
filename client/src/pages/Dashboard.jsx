import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Lock, ShieldCheck, Key } from "lucide-react";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [getGithubToken, setGetGithubToken] = useState(false);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    habits: { total: 0, completed: 0 },
    gitGoals: { total: 0, completed: 0 },
    journals: 0,
  });
  const [githubToken, setgithubToken] = useState("");

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
          setGetGithubToken(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!githubToken) {
      toast.error("Token cannot be empty.");
      return;
    }

    try {
      const response = await api.post("/auth/github/token", { githubToken });

      if (response.status === 200) {
        toast.success("Token saved successfully.");
      } else {
        toast.error("Failed to save token. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while saving the token.", error.message);
    }
  };

  const fetchStats = async () => {
    try {
      const [habitsRes, gitGoalsRes, journalsRes] = await Promise.all([
        api.get("/habits"),
        api.get("/git"),
        api.get("/journal"),
      ]);

      const habits = habitsRes.data;
      const gitGoals = gitGoalsRes.data;
      const journals = journalsRes.data.length;

      setStats({
        habits: {
          total: habits.length,
          completed: habits.filter((h) => h.isCompleted === true).length,
        },
        gitGoals: {
          total: gitGoals.length,
          completed: gitGoals.filter((g) => g.status === "completed").length,
        },
        journal: journals,
      });
    } catch (error) {
      console.error("Stats fetch error:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = sessionStorage.getItem("_token");
        if (!token) {
          navigate("/auth/signin");
          return;
        }

        // Decode token to get user ID
        const decoded = jwtDecode(token);
        const userId = decoded.user.id;

        // Fetch user details
        const response = await api.get(`/auth/user/${userId}`);
        setUser(response.data.user);
      } catch (error) {
        console.error("Fetch user error:", error);
        navigate("/auth/signin");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchStats();
  }, [navigate]);

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
          {/* Welcome Section */}
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg mb-8">
              <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                Welcome back, {user?.firstName || "User"}
              </h1>
              <p className="text-lg text-blue-100">
                Track your progress and stay positive on your journey.
              </p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  Active Habits
                </h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.habits.completed}/{stats.habits.total}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Completed Today
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full transform transition-transform hover:scale-110">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  Git Goals
                </h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.gitGoals.completed}/{stats.gitGoals.total}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Achieved Today</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full transform transition-transform hover:scale-110">
                    <svg
                      className="w-8 h-8 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  Journals
                </h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.journal}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {stats.journal === 1 ? "Journal" : "Journals"}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full transform transition-transform hover:scale-110">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Add GitHub Personal Access Token
                  </h2>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Securely connect your GitHub account to enable repository
                  access
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Security Alert */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    <div className="font-medium text-blue-800">
                      Security Guarantee
                    </div>
                  </div>
                  <div className="mt-2 text-blue-700">
                    Your token is protected using industry-standard encryption:
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>AES-256 encryption at rest</li>
                      <li>TLS 1.3 encryption in transit</li>
                      <li>Encrypted database fields</li>
                      <li>Regular security audits</li>
                    </ul>
                  </div>
                </div>

                {/* Token display and form */}
                {getGithubToken ? (
                  // If GitHub Token exists, show token information
                  <div>
                    <p className="text-sm text-gray-700">
                      Your GitHub Personal Access Token is securely stored.
                    </p>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-800">
                        Token Features:
                      </p>
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li>Access to GitHub repositories</li>
                        <li>Encrypted and securely stored</li>
                        <li>Ready to be used for API interactions</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  // If no GitHub Token, show the form to enter a new one
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="token"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Personal Access Token
                      </label>
                      <div className="relative">
                        <input
                          id="token"
                          type="password"
                          value={githubToken} // Show token or leave blank
                          onChange={(e) => setgithubToken(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Token is stored encrypted and never exposed in logs or
                        error messages
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-2 pt-4">
                      <button
                        type="reset"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Reset
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Save Token
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* News Section */}
            {/* <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 border border-gray-100 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Product News & Updates
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <div className="p-2 bg-blue-100 rounded-lg">
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
                        d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      New Feature: Custom Habit Categories
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Organize your habits better with custom categories and
                      tags.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Upcoming: Mobile App Release
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Stay tuned for our mobile app launch next week!
                    </p>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
