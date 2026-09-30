/**
 * Registration page for TechScope.
 *
 * Handles account creation, form validation, error feedback,
 * and navigation after successful registration.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { register } from "../services/authService";
import "../styles/auth.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await register(username, email, password);

      navigate("/login");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed",
      );
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
        <h1>Create account</h1>

        {error && (
          <p
            className="auth-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <label htmlFor="register-username">
          Username
        </label>

        <input
          id="register-username"
          type="text"
          value={username}
          onChange={(event) =>
            setUsername(event.target.value)
          }
          autoComplete="username"
          required
        />

        <label htmlFor="register-email">
          Email
        </label>

        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          autoComplete="email"
          required
        />

        <label htmlFor="register-password">
          Password
        </label>

        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          autoComplete="new-password"
          required
        />

        <button
          type="submit"
          disabled={
            !username.trim() ||
            !email.trim() ||
            !password ||
            isSubmitting
          }
        >
          {isSubmitting
            ? "Registering..."
            : "Register"}
        </button>

        <p className="auth-link">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}