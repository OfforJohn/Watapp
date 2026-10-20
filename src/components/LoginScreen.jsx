import React, { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";

const CAPTCHA_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function createCaptcha() {
  return Array.from({ length: 5 }, () =>
    CAPTCHA_CHARACTERS[Math.floor(Math.random() * CAPTCHA_CHARACTERS.length)]
  ).join("");
}

export default function LoginScreen({ initialName, error, busy, onContinue }) {
  const [username, setUsername] = useState(initialName || "");
  const [accessKey, setAccessKey] = useState("");
  const [captcha, setCaptcha] = useState(createCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [formError, setFormError] = useState("");
  const [step, setStep] = useState("login");
  const [pin, setPin] = useState("");

  useEffect(() => {
    const canvas = document.getElementById("rextails-captcha");
    const context = canvas?.getContext("2d");
    if (!context) return;

    const { width, height } = canvas;
    context.fillStyle = "#080c0a";
    context.fillRect(0, 0, width, height);
    for (let line = 0; line < 8; line += 1) {
      context.beginPath();
      context.moveTo(Math.random() * width, Math.random() * height);
      context.lineTo(Math.random() * width, Math.random() * height);
      context.strokeStyle = line % 2 ? "#24d879" : "#64736b";
      context.globalAlpha = 0.35;
      context.stroke();
    }
    context.globalAlpha = 1;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "700 30px ui-monospace, monospace";
    [...captcha].forEach((character, index) => {
      context.save();
      context.translate(37 + index * 52, height / 2 + (Math.random() * 8 - 4));
      context.rotate(Math.random() * 0.24 - 0.12);
      context.fillStyle = index % 2 ? "#25df7a" : "#f1f5f2";
      context.fillText(character, 0, 0);
      context.restore();
    });
    context.globalAlpha = 1;
  }, [captcha]);

  const refreshCaptcha = () => {
    setCaptcha(createCaptcha());
    setCaptchaInput("");
    setFormError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!username.trim()) {
      setFormError("Enter your username.");
      return;
    }
    if (!accessKey) {
      setFormError("Enter your access key.");
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captcha) {
      setFormError("That security code doesn’t match. Try again.");
      refreshCaptcha();
      return;
    }
    setFormError("");
    setStep("pin");
    setFormError("");
  };

  const handlePinSubmit = (event) => {
    event.preventDefault();
    if (pin.length !== 4 || busy) return;
    onContinue(username.trim());
  };

  const handlePinChange = (event) => {
    const nextPin = event.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(nextPin);
    if (nextPin.length === 4 && !busy) onContinue(username.trim());
  };

  return (
    <main className="rextails-login">
      <section className="rextails-login-content" aria-label="Sign in to Rextails">
        <div className="rextails-wordmark" aria-label="Rextails">Rextails</div>
        <form
          className="rextails-login-card"
          onSubmit={step === "login" ? handleSubmit : handlePinSubmit}
        >
          {step === "login" ? (
            <>
          <div className="rextails-secure-label">
            <span className="rextails-secure-dot" />
            Secured on this device
          </div>
          <h1>Welcome back</h1>
          <p className="rextails-login-subtitle">Sign in to continue to Rextails.</p>

          <label className="rextails-field">
            <span>Username</span>
            <input
              autoFocus
              autoComplete="username"
              maxLength={40}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              required
            />
          </label>

          <label className="rextails-field">
            <span>Access key</span>
            <input
              type="password"
              autoComplete="current-password"
              value={accessKey}
              onChange={(event) => setAccessKey(event.target.value)}
              placeholder="Access key"
              required
            />
          </label>

          <div className="rextails-field">
            <span>Security check</span>
            <div className="rextails-captcha-row">
              <canvas
                id="rextails-captcha"
                className="rextails-captcha"
                width="300"
                height="72"
                aria-label="Security code"
              />
              <button
                className="rextails-refresh"
                type="button"
                onClick={refreshCaptcha}
                aria-label="Generate a new security code"
                title="New code"
              >
                <FiRefreshCw aria-hidden="true" />
              </button>
            </div>
            <input
              className="rextails-captcha-input"
              type="text"
              autoComplete="off"
              maxLength={5}
              value={captchaInput}
              onChange={(event) => setCaptchaInput(event.target.value.toUpperCase())}
              placeholder="Type the code above"
              aria-label="Enter the security code"
              required
            />
          </div>

          {formError && (
            <p className="rextails-login-error" role="alert">{formError}</p>
          )}
          <button className="rextails-continue" type="submit" disabled={busy}>
            Continue
          </button>
            </>
          ) : (
            <>
              <div className="rextails-secure-label">
                <span className="rextails-secure-dot" />
                Step 2 of 2 · PIN verification
              </div>
              <h1>Enter your PIN</h1>
              <p className="rextails-login-subtitle">
                Type your 4-digit security PIN to finish signing in.
              </p>
              <div className="rextails-pin-dots" aria-hidden="true">
                {[0, 1, 2, 3].map((index) => (
                  <span className={pin.length > index ? "is-filled" : ""} key={index} />
                ))}
              </div>
              <input
                autoFocus
                className="rextails-pin-input"
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={4}
                value={pin}
                onChange={handlePinChange}
                aria-label="4-digit PIN"
                disabled={busy}
                required
              />
              {(formError || error) && (
                <p className="rextails-login-error" role="alert">{formError || error}</p>
              )}
              {busy && <p className="rextails-pin-status">Verifying PIN…</p>}
              <button
                className="rextails-back"
                type="button"
                onClick={() => {
                  setStep("login");
                  setPin("");
                  setFormError("");
                }}
                disabled={busy}
              >
                Back
              </button>
            </>
          )}
        </form>
      </section>
    </main>
  );
}
