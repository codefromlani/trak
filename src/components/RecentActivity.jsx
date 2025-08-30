// src/components/RecentActivity.jsx
import { useState, useEffect } from "react";
import { BookOpen, ChevronRight } from "lucide-react";

const RecentActivity = ({ refreshKey }) => {
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecentSessions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/dashboard/recent/course`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recent sessions");
      }

      const data = await response.json();
      setRecentSessions(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching recent sessions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentSessions();
  }, [refreshKey]);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    const today = new Date();

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

    const options = { month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(to bottom right, #50C7C7, #45B0E0)",
            }}
          >
            {" "}
            {/* Teal to Cyan gradient */}
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h3
            className="text-xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Recent Activity
          </h3>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 rounded-xl animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(to bottom right, #50C7C7, #45B0E0)",
            }}
          >
            {" "}
            {/* Teal to Cyan gradient */}
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h3
            className="text-xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Recent Activity
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500 text-sm">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: "linear-gradient(to bottom right, #50C7C7, #45B0E0)",
          }}
        >
          {" "}
          {/* Teal to Cyan gradient */}
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <h3
          className="text-xl font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Recent Activity
        </h3>
      </div>
      <div className="space-y-2">
        {recentSessions.length > 0 ? (
          recentSessions.map((session, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 rounded-xl hover:bg-white/50 transition-all duration-200 group cursor-pointer"
            >
              <span
                className="font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {formatDate(session.date)}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {session.course_name}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              No recent study sessions yet.
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Start studying to see your activity here!
            </p>
          </div>
        )}
      </div>

      {recentSessions.length === 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={fetchRecentSessions}
            className="px-4 py-2 text-sm text-text-secondary border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Refresh Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
