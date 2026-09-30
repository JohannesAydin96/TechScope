/**
 * Login page for TechScope.
 *
 * Handles user authentication, login validation, error feedback,
 * token storage, and navigation after successful login.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { login } from "../services/authService";
import "../styles/auth.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await login(email, password);

      localStorage.setItem("token", data.access_token);

      navigate("/", { replace: true });
    } catch {
      setError("Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form
        className="auth-card"
        onSubmit={handleSubmit}
      >
        <h1>Login</h1>

        {error && (
          <p
            className="auth-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <label htmlFor="login-email">
          Email
        </label>

        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          autoComplete="email"
          required
        />

        <label htmlFor="login-password">
          Password
        </label>

        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          disabled={
            !email.trim() ||
            !password ||
            isSubmitting
          }
        >
          {isSubmitting
            ? "Logging in..."
            : "Login"}
        </button>

        <p className="auth-link">
          No account?{" "}
          <Link to="/register">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}