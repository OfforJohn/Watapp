import { useState } from "react";

export default function StartupErrorScreen({ onRetry }) {
  const [working, setWorking] = useState(false);

  const handleRetry = () => {
    setWorking(true);
    window.setTimeout(() => {
      setWorking(false);
      onRetry();
    }, 900);
  };

  return (
    <main className="startup-error-screen">
      <section className="startup-error-content" aria-labelledby="startup-error-title">
        <div className="startup-error-face" aria-hidden="true">
          :(
        </div>
        <h1 id="startup-error-title" className="startup-error-message">
          A problem occurred and the process was stopped to prevent damage.
          <br />
          The session has not been started.
        </h1>
        <pre className="startup-error-details">
          <code>{`FATAL: session_init failed
  module .......... secure.core
  stop code ....... 0x000000F4
  phase ........... PRE_AUTH
  handler ......... 0x4A1F
  state ........... NOT_READY`}</code>
        </pre>
        <p className="startup-error-recovery">
          If this keeps happening, run the recovery step.
        </p>
        <button
          className="startup-error-retry"
          type="button"
          onClick={handleRetry}
          disabled={working}
        >
          <span aria-hidden="true">{working ? "..." : "▶"}</span>
          {working ? "WORKING" : "RETRY"}
        </button>
      </section>
    </main>
  );
}
