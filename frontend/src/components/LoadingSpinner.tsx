/**
 * Reusable loading indicator for TechScope.
 *
 * Displays a configurable spinner and loading message
 * for asynchronous UI states.
 */

type LoadingSpinnerProps = {
  message?: string;
  size?: "small" | "medium" | "large";
};

export default function LoadingSpinner({
  message = "Loading...",
  size = "medium",
}: LoadingSpinnerProps) {
  return (
    <div
      className="loading-state"
      role="status"
      aria-live="polite"
    >
      <div
        className={`loading-spinner loading-spinner-${size}`}
        aria-hidden="true"
      />

      <p>{message}</p>
    </div>
  );
}