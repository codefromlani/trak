import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Logo from "../assets/trak-logo.svg";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  function validate() {
    const next = { email: "", password: "" };
    if (!email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email";

    if (!password) next.password = "Password is required";
    else if (password.length < 8) next.password = "Use at least 8 characters";

    setErrors(next);
    return !next.email && !next.password;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to login");
      }

      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);

      const meRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      if (!meRes.ok) throw new Error("Failed to fetch user profile");
      const user = await meRes.json();

      navigate("/dashboard", { state: { user } });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-text-primary relative font-inter">
      {/* Top-left logo */}
      <div className="absolute left-6 top-6 flex items-center gap-2">
        <img src={Logo} alt="Logo" className="h-10 w-10" />
      </div>

      {/* Centered form */}
      <div className="max-w-md mx-auto pt-28 pb-16 px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-center">
          Log in
        </h1>

        <form onSubmit={onSubmit} className="mt-10 space-y-6" noValidate>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-secondary"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={`mt-2 w-full h-12 rounded-md border px-3 outline-none transition focus:ring-2 focus:ring-primary focus:border-primary bg-white placeholder:text-text-secondary ${
                errors.email ? "border-red-400" : "border-text-secondary"
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-2 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-secondary"
            >
              Password
            </label>
            <div className="relative mt-2">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className={`w-full h-12 rounded-md border pr-12 px-3 outline-none transition focus:ring-2 focus:ring-primary focus:border-primary bg-white placeholder:text-text-secondary ${
                  errors.password ? "border-red-400" : "border-text-secondary"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-3 my-auto grid place-items-center text-text-secondary hover:text-text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-2 text-sm text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary hover:bg-[#6b72e0] text-white font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px bg-text-secondary flex-1" />
            <span className="text-xs text-text-secondary">OR</span>
            <div className="h-px bg-text-secondary flex-1" />
          </div>

          {/* Google button */}
          <a
            href={`${import.meta.env.VITE_API_URL}/auth/google`}
            className="w-full h-11 rounded-xl border border-text-secondary bg-white hover:bg-background text-text-secondary font-medium shadow-sm inline-flex items-center justify-center gap-2"
            aria-label="Log in with Google"
          >
            <GoogleIcon className="h-5 w-5" />
            <span>Log in with Google</span>
          </a>
        </form>

        {/* Footer */}
        <p className="mt-10 text-center text-sm text-text-secondary">
          Don’t have an account?{" "}
          <a href="/" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 533.5 544.3" aria-hidden="true">
      <path
        d="M533.5 278.4c0-18.5-1.6-36.5-4.7-53.8H272v101.8h146.9c-6.3 34.4-25.5 63.4-54.3 82.8v68h87.8c51.4-47.4 81.1-117.2 81.1-198.8z"
        fill="#4285F4"
      />
      <path
        d="M272 544.3c73.5 0 135.3-24.4 180.4-66.1l-87.8-68c-24.4 16.4-55.8 26-92.6 26-71 0-131.2-47.9-152.8-112.1H29.3v70.4C74.5 489.7 166.7 544.3 272 544.3z"
        fill="#34A853"
      />
      <path
        d="M119.2 324.1c-10.2-30.1-10.2-63.7 0-93.8V159.9H29.3c-39.1 77.9-39.1 170.7 0 248.6l89.9-84.4z"
        fill="#FBBC05"
      />
      <path
        d="M272 106.3c39.9-.6 78.3 15.1 107.4 43.6l80.3-80.3C405.8 24.3 343.7-.2 272 0 166.7 0 74.5 54.6 29.3 135.9l89.9 70.4C140.8 154.1 201 106.3 272 106.3z"
        fill="#EA4335"
      />
    </svg>
  );
}
