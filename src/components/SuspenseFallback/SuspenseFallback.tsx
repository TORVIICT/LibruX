import "./SuspenseFallback.scss";

interface SuspenseFallbackProps {
  message?: string;
}

export function SuspenseFallback({ message = "Loading content..." }: SuspenseFallbackProps = {}) {
  return (
    <div className="suspense-fallback-container" role="status" aria-live="polite">
      <span className="material-symbols-outlined suspense-fallback-spinner">autorenew</span>
      <p className="suspense-fallback-text">{message}</p>
    </div>
  );
}

export default SuspenseFallback;
