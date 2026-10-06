
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  CircleUserRound,
  Info,
  LockKeyhole,
  LogOut,
  Monitor,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react';

type SettingsSection =
  | 'profile'
  | 'security'
  | 'preferences'
  | 'about';

type UserProfile = {
  name: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
};

const sections = [
  {
    id: 'profile' as SettingsSection,
    label: 'Profile',
    description: 'Manage your account information',
    icon: CircleUserRound,
  },
  {
    id: 'security' as SettingsSection,
    label: 'Security',
    description: 'Password and account security',
    icon: ShieldCheck,
  },
  {
    id: 'preferences' as SettingsSection,
    label: 'Preferences',
    description: 'Customize your workspace',
    icon: SlidersHorizontal,
  },
  {
    id: 'about' as SettingsSection,
    label: 'About',
    description: 'Application information',
    icon: Info,
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>('profile');

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    username: '',
    email: '',
    role: '',
    isActive: true,
  });

  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] =
    useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        setProfile({
          name: user.name ?? '',
          username: user.username ?? '',
          email: user.email ?? '',
          role: user.role ?? '',
          isActive: user.isActive ?? true,
        });
      } catch {
        // Ignore invalid local storage data.
      }
    }
  }, []);

  const handleSavePreferences = () => {
    localStorage.setItem(
      'settings',
      JSON.stringify({
        notifications,
        emailNotifications,
        compactMode,
      }),
    );

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <main className="min-h-screen bg-[#020706] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#39ff14]/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-[#39ff14]"
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#39ff14]/15 bg-[#39ff14]/5">
                <SlidersHorizontal
                  size={22}
                  className="text-[#39ff14]"
                />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Settings
                </h1>
                <p className="mt-1 text-sm text-white/40">
                  Manage your account and workspace preferences.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Settings Navigation */}
          <aside className="h-fit rounded-3xl border border-white/[0.07] bg-white/[0.025] p-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="mb-3 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25">
                Workspace
              </p>
            </div>

            <div className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const active =
                  activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() =>
                      setActiveSection(section.id)
                    }
                    className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                      active
                        ? 'border border-[#39ff14]/10 bg-[#39ff14]/[0.07]'
                        : 'border border-transparent hover:bg-white/[0.035]'
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        active
                          ? 'bg-[#39ff14]/10 text-[#39ff14]'
                          : 'bg-white/[0.04] text-white/40 group-hover:text-white/70'
                      }`}
                    >
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          active
                            ? 'text-white'
                            : 'text-white/65'
                        }`}
                      >
                        {section.label}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-white/25">
                        {section.description}
                      </p>
                    </div>

                    {active && (
                      <ChevronRight
                        size={15}
                        className="text-[#39ff14]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="my-4 h-px bg-white/[0.06]" />

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-red-500/[0.06]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/5 text-red-400/70">
                <LogOut size={17} />
              </div>

              <div>
                <p className="text-sm font-medium text-white/65">
                  Sign out
                </p>
                <p className="text-[11px] text-white/25">
                  End your current session
                </p>
              </div>
            </button>
          </aside>

          {/* Content */}
          <section className="min-w-0">
            {/* Profile */}
            {activeSection === 'profile' && (
              <div className="space-y-5">
                <SettingsHeader
                  icon={UserRound}
                  title="Profile"
                  description="Your account information and access level."
                />

                <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <div className="mb-7 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#39ff14]/15 bg-[#39ff14]/5 text-xl font-semibold text-[#39ff14]">
                      {profile.name
                        ? profile.name.charAt(0).toUpperCase()
                        : 'U'}
                    </div>

                    <div>
                      <h2 className="font-semibold text-white">
                        {profile.name || 'Your account'}
                      </h2>
                      <p className="text-sm text-white/35">
                        @{profile.username || 'username'}
                      </p>
                    </div>

                    <div className="ml-auto">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                          profile.isActive
                            ? 'border-[#39ff14]/15 bg-[#39ff14]/5 text-[#39ff14]'
                            : 'border-red-400/15 bg-red-400/5 text-red-300'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            profile.isActive
                              ? 'bg-[#39ff14]'
                              : 'bg-red-400'
                          }`}
                        />
                        {profile.isActive
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <InfoField
                      label="Full name"
                      value={profile.name || 'Not available'}
                    />

                    <InfoField
                      label="Username"
                      value={
                        profile.username
                          ? `@${profile.username}`
                          : 'Not available'
                      }
                    />

                    <InfoField
                      label="Email address"
                      value={
                        profile.email || 'Not available'
                      }
                    />

                    <InfoField
                      label="Role"
                      value={
                        profile.role
                          ? profile.role
                              .charAt(0)
                              .toUpperCase() +
                            profile.role.slice(1)
                          : 'Not available'
                      }
                    />
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/[0.05] bg-black/10 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck
                        size={18}
                        className="mt-0.5 text-[#39ff14]"
                      />

                      <div>
                        <p className="text-sm font-medium text-white/80">
                          Account access
                        </p>
                        <p className="mt-1 text-xs leading-5 text-white/30">
                          Your access level is controlled by your
                          assigned role. Contact an administrator
                          if your permissions need to be changed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeSection === 'security' && (
              <div className="space-y-5">
                <SettingsHeader
                  icon={LockKeyhole}
                  title="Security"
                  description="Keep your account protected."
                />

                <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#39ff14]/5 text-[#39ff14]">
                      <LockKeyhole size={19} />
                    </div>

                    <div>
                      <h2 className="font-medium text-white">
                        Password
                      </h2>
                      <p className="mt-1 text-sm text-white/35">
                        Change your account password regularly to
                        keep your account secure.
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 space-y-5">
                    <PasswordField
                      label="Current password"
                      placeholder="Enter current password"
                    />

                    <PasswordField
                      label="New password"
                      placeholder="Enter new password"
                    />

                    <PasswordField
                      label="Confirm new password"
                      placeholder="Confirm new password"
                    />

                    <button
                      type="button"
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#39ff14] px-5 text-sm font-semibold text-black transition hover:bg-[#50ff31] active:scale-[0.98]"
                    >
                      <LockKeyhole size={16} />
                      Update password
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
                  <div className="flex items-start gap-4">
                    <ShieldCheck
                      size={20}
                      className="mt-0.5 text-[#39ff14]"
                    />

                    <div>
                      <h3 className="text-sm font-medium text-white/80">
                        Security recommendation
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-white/30">
                        Use a strong password containing uppercase
                        letters, lowercase letters, numbers and
                        special characters.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences */}
            {activeSection === 'preferences' && (
              <div className="space-y-5">
                <SettingsHeader
                  icon={SlidersHorizontal}
                  title="Preferences"
                  description="Customize how your workspace behaves."
                />

                <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <PreferenceRow
                    icon={Bell}
                    title="Notifications"
                    description="Receive notifications about task activity."
                    enabled={notifications}
                    onToggle={() =>
                      setNotifications(!notifications)
                    }
                  />

                  <PreferenceRow
                    icon={Monitor}
                    title="Email notifications"
                    description="Receive important task updates by email."
                    enabled={emailNotifications}
                    onToggle={() =>
                      setEmailNotifications(
                        !emailNotifications,
                      )
                    }
                  />

                  <PreferenceRow
                    icon={SlidersHorizontal}
                    title="Compact mode"
                    description="Use a denser layout to display more information."
                    enabled={compactMode}
                    onToggle={() =>
                      setCompactMode(!compactMode)
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Save preferences
                    </p>
                    <p className="mt-1 text-xs text-white/30">
                      Your preferences are stored locally on this
                      device.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#39ff14] px-4 text-sm font-semibold text-black transition hover:bg-[#50ff31]"
                  >
                    {saved ? (
                      <>
                        <Check size={16} />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* About */}
            {activeSection === 'about' && (
              <div className="space-y-5">
                <SettingsHeader
                  icon={Info}
                  title="About"
                  description="Information about your MPlug workspace."
                />

                <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <div className="border-b border-white/[0.06] p-7">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#39ff14]/5 text-xl font-bold text-[#39ff14]">
                        M
                      </div>

                      <div>
                        <h2 className="text-xl font-semibold">
                          MPlug Task Management
                        </h2>
                        <p className="mt-1 text-sm text-white/35">
                          Team productivity and task management
                          workspace.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-white/[0.05]">
                    <AboutRow
                      label="Application"
                      value="MPlug Task Management"
                    />

                    <AboutRow
                      label="Version"
                      value="1.0.0"
                    />

                    <AboutRow
                      label="Environment"
                      value="Production Ready"
                    />

                    <AboutRow
                      label="Frontend"
                      value="Next.js"
                    />

                    <AboutRow
                      label="Backend"
                      value="NestJS"
                    />

                    <AboutRow
                      label="Database"
                      value="PostgreSQL"
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-[#39ff14]/10 bg-[#39ff14]/[0.025] p-6">
                  <div className="flex items-start gap-4">
                    <Info
                      size={19}
                      className="mt-0.5 text-[#39ff14]"
                    />

                    <div>
                      <h3 className="text-sm font-medium text-white">
                        Built by MPlug
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-white/30">
                        A clean, modern workspace designed to help
                        teams organize responsibilities, track
                        progress and stay focused.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function SettingsHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Icon
          size={19}
          className="text-[#39ff14]"
        />
        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>
      </div>

      <p className="mt-1 text-sm text-white/30">
        {description}
      </p>
    </div>
  );
}

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/25">
        {label}
      </p>

      <div className="flex h-11 items-center rounded-xl border border-white/[0.06] bg-black/10 px-3.5 text-sm text-white/65">
        {value}
      </div>
    </div>
  );
}

function PasswordField({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-white/50">
        {label}
      </label>

      <input
        type="password"
        placeholder={placeholder}
        className="input"
      />
    </div>
  );
}

function PreferenceRow({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-white/[0.05] p-5 last:border-b-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.035] text-white/40">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white/80">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-white/30">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={`Toggle ${title}`}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? 'bg-[#39ff14]/80'
            : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}

function AboutRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-4">
      <span className="text-sm text-white/35">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-white/70">
        {value}
      </span>
    </div>
  );
}
