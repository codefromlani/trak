// src/components/StudyFrequency.jsx
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { BarChart as BarChartIcon } from "lucide-react";

const StudyFrequency = ({ refreshKey }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedRange, setSelectedRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const rangeOptions = [
    { value: "7d", label: "7d" },
    { value: "30d", label: "30d" },
    { value: "90d", label: "90d" },
  ];

  const fetchAnalyticsData = async (range) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found");
      }

      const analyticsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/analytics?range=${range}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!analyticsResponse.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      const analyticsResult = await analyticsResponse.json();

      const coursesResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!coursesResponse.ok) {
        throw new Error("Failed to fetch courses");
      }
      const coursesResult = await coursesResponse.json();

      setAnalyticsData({
        ...analyticsResult,
        all_courses: coursesResult.map((c) => c.name),
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData(selectedRange);
  }, [selectedRange, refreshKey]);

  const handleRangeChange = (range) => {
    setSelectedRange(range);
  };

  const prepareChartData = (data) => {
    if (!data || !data.all_courses || !data.course_study_data) return [];

    const courseDataMap = new Map(
      data.course_study_data.map((item) => [item.course_name, item.study_days])
    );

    return data.all_courses.map((courseName) => ({
      course_name: courseName,
      study_days: courseDataMap.get(courseName) || 0,
    }));
  };

  const chartData = prepareChartData(analyticsData);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg"
          style={{ color: "var(--color-text-primary)" }}
        >
          <p className="text-sm font-medium">Course: {data.course_name}</p>
          <p className="text-sm">Study Days: {data.study_days}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 h-fit">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(to bottom right, var(--color-primary), var(--color-accent-pink))",
              }}
            >
              <BarChartIcon className="w-4 h-4 text-white" />
            </div>
            <h3
              className="text-xl font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Study Frequency
            </h3>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {rangeOptions.map((period) => (
              <button
                key={period.value}
                onClick={() => handleRangeChange(period.value)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedRange === period.value
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center h-80">
          <p className="text-text-secondary">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 h-fit">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(to bottom right, var(--color-primary), var(--color-accent-pink))",
              }}
            >
              <BarChartIcon className="w-4 h-4 text-white" />
            </div>
            <h3
              className="text-xl font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Study Frequency
            </h3>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {rangeOptions.map((period) => (
              <button
                key={period.value}
                onClick={() => handleRangeChange(period.value)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedRange === period.value
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center h-80">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background:
                "linear-gradient(to bottom right, var(--color-primary), var(--color-accent-pink))",
            }}
          >
            <BarChartIcon className="w-4 h-4 text-white" />
          </div>
          <h3
            className="text-xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Study Frequency
          </h3>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {rangeOptions.map((period) => (
            <button
              key={period.value}
              onClick={() => handleRangeChange(period.value)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                selectedRange === period.value
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-accent-pink)"
                    stopOpacity={0.6}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="course_name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="study_days"
                fill="url(#barGradient)"
                radius={[8, 8, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p
              className="text-text-secondary text-center"
              style={{ color: "var(--color-text-secondary)" }}
            >
              No study data available for the selected period.
            </p>
          </div>
        )}
      </div>
      <div className="mt-4 text-center">
        <button className="px-4 py-2 text-sm text-text-secondary border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          View Full Analytics
        </button>
      </div>
    </div>
  );
};

export default StudyFrequency;
