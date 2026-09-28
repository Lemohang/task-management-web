'use client';

import { FormEvent, useMemo, useState } from 'react';
import { login } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  /*
   * Generate the background particles once.
   * They are rendered as real DOM elements so the
   * background feels alive instead of looking like
   * a static image.
   */
  const particles = useMemo(() => {
    return Array.from({ length: 120 }, (_, index) => ({
      id: index,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2.5 + 0.6,
      opacity: Math.random() * 0.65 + 0.15,
      duration: Math.random() * 7 + 5,
      delay: Math.random() * 8,
      blur: Math.random() > 0.8 ? 2 : 0,
    }));
  }, []);

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const data = await login(
        email,
        password,
      );

      localStorage.setItem(
        'accessToken',
        data.accessToken,
      );

      window.location.href = '/dashboard';
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      {/* =========================================
          ATMOSPHERIC BACKGROUND
      ========================================= */}

      <div className="background">

        <div className="aurora aurora-green" />
        <div className="aurora aurora-teal" />
        <div className="aurora aurora-blue" />

        <div className="light-orb orb-one" />
        <div className="light-orb orb-two" />
        <div className="light-orb orb-three" />

        <div className="light-streak streak-one" />
        <div className="light-streak streak-two" />
        <div className="light-streak streak-three" />

        <div className="particles">
          {particles.map((particle) => (
            <span
              key={particle.id}
              className="particle"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: particle.opacity,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`,
                filter: `blur(${particle.blur}px)`,
              }}
            />
          ))}
        </div>

        <div className="background-noise" />
      </div>

      {/* =========================================
          TOP BRAND
      ========================================= */}

      <div className="top-brand">
        <img
          src="/mpuglogo.png"
          alt="MPlug"
        />

        <div className="top-brand-text">
          <strong>MPLUG</strong>

          <span>
            POWERING IDEAS. CONNECTING FUTURES.
          </span>
        </div>
      </div>

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <section className="login-layout">

        {/* =======================================
            LEFT HERO
        ======================================= */}

        <div className="hero-content">

          <div className="eyebrow">
            <span className="eyebrow-line" />

            TASK MANAGEMENT
          </div>

          <h1>
            WORK WITH
            <br />
            CLARITY.
            <br />
            MOVE WITH
            <br />
            PURPOSE.
          </h1>

          <p className="hero-description">
            A focused workspace for MPlug to turn
            responsibilities and projects into
            meaningful progress.
          </p>

          <div className="hero-decoration">
            <span />
            <span />
            <span />
          </div>
        </div>

        {/* =======================================
            LOGIN CARD
        ======================================= */}

        <div className="login-area">

          <div className="glass-card">

            {/* Glass shine */}
            <div className="card-shine" />

            {/* Logo */}
            <div className="card-logo">

              <div className="logo-glow" />

              <img
                src="/mpuglogo.png"
                alt="MPlug"
              />

              <div className="card-brand">
                <strong>MPLUG</strong>

                <span>
                  POWERING IDEAS. CONNECTING FUTURES.
                </span>
              </div>
            </div>

            {/* Welcome */}
            <div className="welcome">

              <h2>
                WELCOME BACK
              </h2>

              <p>
                Sign in to access your MPlug task
                management workspace and keep the
                team moving.
              </p>

            </div>

            {/* Form */}
            <form
              onSubmit={handleLogin}
              className="login-form"
            >

              {/* Email */}
              <div className="form-field">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-container">

                  <svg
                    className="input-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />

                    <path d="m3 7 9 6 9-6" />
                  </svg>

                  <input
                    id="email"
                    type="email"
                    placeholder="name@mplug.com.ls"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value,
                      )
                    }
                    autoComplete="email"
                    required
                  />

                </div>
              </div>

              {/* Password */}
              <div className="form-field">

                <div className="password-heading">

                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-button"
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="input-container">

                  <svg
                    className="input-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="10"
                      rx="2"
                    />

                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current,
                      )
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 4.3A10.8 10.8 0 0 1 12 4c5 0 8.5 4 10 8a16.6 16.6 0 0 1-3.2 4.8" />
                        <path d="M6.2 6.2C4.5 7.4 3.3 9.3 2 12c1.5 4 5 8 10 8 1.2 0 2.3-.2 3.3-.6" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                        />
                      </svg>
                    )}
                  </button>

                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              {/* Sign in */}
              <button
                type="submit"
                className="signin-button"
                disabled={loading}
              >

                <span>
                  {loading
                    ? 'SIGNING IN...'
                    : 'SIGN IN'}
                </span>

                {!loading && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                )}

              </button>

            </form>

            <div className="login-footer">

              <span>
                Don't have an account?
              </span>

              <button type="button">
                Contact administrator
              </button>

            </div>

          </div>
        </div>

      </section>

      {/* Bottom subtle mark */}

      <div className="bottom-mark">
        MPLUG TASK MANAGEMENT
      </div>

    </main>
  );
}