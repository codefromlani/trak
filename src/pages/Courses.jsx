import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

export default function Courses() {
  const [user, setUser] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function fetchUser() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        setUser(data);
      } catch {
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    }

    fetchUser();
  }, [navigate]);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    setIsSubmitting(true);
    const token = localStorage.getItem("access_token");

    const courses = courseName
      .split(/[\n,]+/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map((name) => ({ name }));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courses),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to add course");
      }

      setCourseName("");
      toast.success("Course created!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to add course:", error);
      toast.error(error.message || "An error occurred!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary font-inter text-center mb-10">
            Add a New Course
          </h1>

          {/* Card Container */}
          <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-100">
            <form onSubmit={handleAddCourse} className="space-y-6">
              <div>
                <label
                  htmlFor="courseName"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Course Names
                </label>
                <textarea
                  id="courseName"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Enter course names (one per line)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-inter text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm"
                  rows={5}
                  disabled={isSubmitting}
                />
                <p className="mt-2 text-xs text-text-secondary">
                  Tip: You can add multiple courses by separating them with
                  commas or line breaks.
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting || !courseName.trim()}
                  className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-medium font-inter rounded-full hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? "Adding..." : "Add Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-text-secondary text-sm font-inter">
            ©2025 Trak — All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}

<footer className="px-6 py-6">
  <div className="max-w-7xl mx-auto">
    <p className="text-text-secondary text-sm font-inter">©2025 Trak</p>
  </div>
</footer>;
