import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function Settings() {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    githubToken: "",
  });

  useEffect(() => {
    // Get and decode token when component mounts
    const token = sessionStorage.getItem("_token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.user.id);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    // Validate password length
    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    try {
      const response = await api.put(
        `http://localhost:5000/api/auth/edit/${userId}`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          githubToken: formData.githubToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Use response.data instead of response.json()
      const data = response.data;

      if (!response.status || response.status >= 400) {
        throw new Error(data.message || "Failed to update password");
      }

      // Clear form and show success message
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        githubToken: "",
      });
      toast.success("Password updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update password"
      );
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

        const decoded = jwtDecode(token);
        const userId = decoded.user.id;

        // Fetch user details
        const response = await api.get(`/auth/user/${userId}`);
        const userData = response.data.user;
        setFormData((prevFormData) => ({
          ...prevFormData,
          githubToken: userData.githubToken,
        }));

        setUser(userData);
        // Format registration date
      } catch (error) {
        console.error("Fetch user error:", error);
        navigate("/auth/signin");
      }
    };

    fetchUserData();
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
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              Settings
            </h1>
            <p className="text-lg text-blue-100">Your Profile Information</p>
          </div>

          {/* Profile Information */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 border border-gray-100 shadow-lg">
            <div className="max-w-3xl mx-auto">
              {/* Avatar Section */}
              <div className="flex items-center space-x-8 mb-8">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                  <img
                    src={user?.avatar || "https://via.placeholder.com/50"}
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {user?.id ? `${user.id}` : "Loading..."}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user?.email}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Password Fields */}
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="githubToken"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Github Personal Access Token
                    </label>
                    <input
                      type="text"
                      id="githubToken"
                      name="githubToken"
                      value={formData.githubToken}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
