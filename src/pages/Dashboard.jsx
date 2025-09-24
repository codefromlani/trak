// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StudyFrequency from "../components/StudyFrequency";
import RecentActivity from "../components/RecentActivity";
import toast from "react-hot-toast";
import { Calendar, Award, Target } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  const [checkedCourses, setCheckedCourses] = useState(new Set());
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  async function fetchUser(token) {
    if (!token) throw new Error("No token provided");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Unauthorized");
    return await res.json();
  }

  async function fetchDashboardSummary(token) {
    if (!token) throw new Error("No token provided");
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/dashboard/summary`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error("Failed to fetch summary");
    return await res.json();
  }

  async function fetchChecklistItems(token) {
    if (!token) throw new Error("No token provided");
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/dashboard/checklist`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error("Failed to fetch checklist");
    return await res.json();
  }

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function loadData() {
      try {
        const userData = await fetchUser(token);
        setUser(userData);
        const summaryData = await fetchDashboardSummary(token);
        setSummary(summaryData);
        const checklistData = await fetchChecklistItems(token);
        setChecklistItems(checklistData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    }
    loadData();
  }, [navigate]);

  const handleCourseCheck = (courseName) => {
    const newChecked = new Set(checkedCourses);
    if (newChecked.has(courseName)) {
      newChecked.delete(courseName);
    } else {
      newChecked.add(courseName);
    }
    setCheckedCourses(newChecked);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    const today = new Date();

    const diffTime = today.getTime() - date.getTime();

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (
      today.getUTCDate() === date.getUTCDate() &&
      today.getUTCMonth() === date.getUTCMonth() &&
      today.getUTCFullYear() === date.getUTCFullYear()
    ) {
      return "Today";
    }

    const yesterday = new Date(today);
    yesterday.setUTCDate(today.getUTCDate() - 1);
    if (
      yesterday.getUTCDate() === date.getUTCDate() &&
      yesterday.getUTCMonth() === date.getUTCMonth() &&
      yesterday.getUTCFullYear() === date.getUTCFullYear()
    ) {
      return "Yesterday";
    }

    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  };

  const handleSaveLog = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found.");
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          course_names: Array.from(checkedCourses),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to save log");
      }

      const data = await res.json();
      toast.success("Log saved");

      const updatedSummary = await fetchDashboardSummary(token);
      setSummary(updatedSummary);

      const updatedChecklist = await fetchChecklistItems(token);
      setChecklistItems(updatedChecklist);

      setCheckedCourses(new Set());

      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error saving log:", error);
      toast.error("Failed to save log. Please try again.");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 px-8 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 font-inter">
                Hi {user.username} <span className="text-2xl">👋</span>
              </h1>
            </div>

            <p className="text-gray-600 text-lg font-inter">
              Here's how you've been doing lately.
            </p>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Total Study Days */}
              <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 text-center">
                <div className="relative">
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(to bottom right, var(--color-primary), #6a70e0)",
                      }}
                    >
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">
                    Total Study Days
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {summary.total_study_days}
                  </p>
                  <p className="text-xs text-gray-500">Since you joined</p>
                </div>
              </div>

              {/* Current Streak */}
              <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1 text-center">
                <div className="relative">
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(to bottom right, var(--color-accent-pink), #e6a1ac)",
                      }}
                    >
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex ml-2"></div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">
                    Current Streak
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {summary.current_streak}
                  </p>
                  <p className="text-xs text-gray-500">days in a row</p>
                </div>
              </div>

              {/* Most Studied Course */}
              <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 text-center">
                <div className="relative">
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(to bottom right, var(--color-accent-mint), #7cc2b2)",
                      }}
                    >
                      <Award className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">
                    Most Studied Course
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {summary.most_studied_course?.name || "None yet"}
                  </p>
                  {summary.most_studied_course && (
                    <p className="text-xs text-gray-500">
                      {summary.most_studied_course.days} days
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Today's Checklist */}
            <div className="lg:col-span-1">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 h-fit">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(to bottom right, var(--color-primary), var(--color-accent-pink))",
                    }}
                  >
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <h3
                    className="text-xl font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Today's Checklist
                  </h3>
                </div>
                <div className="space-y-4">
                  {checklistItems.map((item, index) => (
                    <div
                      key={index}
                      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/50 transition-all duration-200"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          id={`course-${index}`}
                          checked={checkedCourses.has(item.course_name)}
                          onChange={() => handleCourseCheck(item.course_name)}
                          className="w-5 h-5 bg-white border-2 rounded-md focus:ring-2 transition-colors"
                          style={{
                            borderColor: "var(--color-text-secondary)",
                            color: "var(--color-primary)",
                            "--tw-ring-color": "var(--color-primary)",
                          }}
                        />
                        {checkedCourses.has(item.course_name) && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <label
                          htmlFor={`course-${index}`}
                          className="block font-medium cursor-pointer transition-colors"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {item.course_name}
                        </label>
                        <p
                          className="text-sm"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          Last studied: {formatDate(item.last_studied_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {checklistItems.length === 0 && (
                    <p
                      className="text-center py-8 text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      No courses enrolled yet. Add some courses to start
                      tracking!
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSaveLog}
                  disabled={checkedCourses.size === 0}
                  className="w-full mt-6 px-6 py-3 hover:from-[color:#6a70e0] hover:to-[color:#e6a1ac] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100"
                  style={{
                    background:
                      "linear-gradient(to right, var(--color-primary), var(--color-accent-pink))",
                  }}
                >
                  Save Today's Log
                </button>
              </div>
            </div>

            {/* Right Side - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Study Frequency */}
              <StudyFrequency refreshKey={refreshKey} />

              {/* Recent Activity */}
              <RecentActivity refreshKey={refreshKey} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-8">
          <p className="text-gray-500 text-sm font-inter">
            ©2025 Trak — All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
