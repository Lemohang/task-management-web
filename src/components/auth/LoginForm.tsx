'use client';

import {
  FormEvent,
  useState,
} from 'react';

import { login } from '@/lib/api';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
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

      window.location.href =
        '/dashboard';
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Something went wrong.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-[13px] font-medium tracking-wide text-white/70"
        >
          Email address
        </label>

        <div className="group relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25 transition group-focus-within:text-emerald-400">
            <svg
              width="18"
              height="18"
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
          </div>

          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="name@mplug.com.ls"
            required
            className="h-14 w-full rounded-xl border border-white/[0.09] bg-white/[0.035] pl-12 pr-4 text-sm text-white outline-none transition duration-200 placeholder:text-white/20 hover:border-white/[0.15] focus:border-emerald-400/50 focus:bg-emerald-400/[0.025] focus:ring-4 focus:ring-emerald-400/[0.06]"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-[13px] font-medium tracking-wide text-white/70"
          >
            Password
          </label>

          <button
            type="button"
            className="text-[12px] font-medium text-emerald-400 transition hover:text-emerald-300"
          >
            Forgot password?
          </button>
        </div>

        <div className="group relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25 transition group-focus-within:text-emerald-400">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <rect
                x="4"
                y="10"
                width="16"
                height="11"
                rx="2"
              />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </div>

          <input
            id="password"
            type={
              showPassword
                ? 'text'
                : 'password'
            }
            autoComplete="current-password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
            required
            className="h-14 w-full rounded-xl border border-white/[0.09] bg-white/[0.035] pl-12 pr-16 text-sm text-white outline-none transition duration-200 placeholder:text-white/20 hover:border-white/[0.15] focus:border-emerald-400/50 focus:bg-emerald-400/[0.025] focus:ring-4 focus:ring-emerald-400/[0.06]"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (value) => !value,
              )
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-wider text-white/25 transition hover:text-emerald-400"
          >
            {showPassword
              ? 'Hide'
              : 'Show'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
          <svg
            className="mt-0.5 shrink-0"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
            />
            <path d="M12 8v5" />
            <path d="M12 16h.01" />
          </svg>

          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="group relative h-14 w-full overflow-hidden rounded-xl bg-emerald-500 text-sm font-semibold text-[#02110c] shadow-[0_12px_40px_rgba(16,185,129,0.12)] transition duration-300 hover:bg-emerald-400 hover:shadow-[0_15px_45px_rgba(16,185,129,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#02110c]/30 border-t-[#02110c]" />
              Signing in
            </>
          ) : (
            <>
              Sign in
              <span className="text-base transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </>
          )}
        </span>
      </button>
    </form>
  );
}