

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

import { useRouter } from 'next/navigation';





type SettingsSection =

  | 'profile'

  | 'security'

  | 'preferences'

  | 'about';



type UserProfile = {

  id?: number;

  name: string;

  email: string;

  role: string;

  isActive: boolean;

};



const API_URL =

  process.env.NEXT_PUBLIC_API_URL ??

  'http://localhost:3001';



function getUserIdFromToken(
  token: string,
): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized));
    const userId = decoded.sub ?? decoded.id;
    if (userId === undefined || userId === null) return null;
    const numericId = Number(userId);
    return Number.isNaN(numericId) ? null : numericId;
  } catch {
    return null;
  }
}

const sections = [

  {

    id: 'profile' as SettingsSection,

    label: 'Profile',

    description: 'Manage your account information',

    icon: CircleUserRound,

  },

  {

    id: 'security' as SettingsSection,

    label: 'security',

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



  const [profile, setProfile] =

    useState<UserProfile>({

      name: '',

      email: '',

      role: '',

      isActive: true,

    });



  const [notifications, setNotifications] =

    useState(true);



  const [emailNotifications, setEmailNotifications] =

    useState(false);



  const [compactMode, setCompactMode] =

    useState(false);



  const [saved, setSaved] =

    useState(false);



  const [savingProfile, setSavingProfile] =

    useState(false);



  const [profileError, setProfileError] =

    useState('');



  const [profileSuccess, setProfileSuccess] =

    useState('');



  const [currentPassword, setCurrentPassword] =

    useState('');



  const [newPassword, setNewPassword] =

    useState('');



  const [confirmPassword, setConfirmPassword] =

    useState('');



  const [changingPassword, setChangingPassword] =

    useState(false);



  const [passwordError, setPasswordError] =

    useState('');



  const [passwordSuccess, setPasswordSuccess] =

    useState('');



  const router = useRouter();





useEffect(() => {

  const loadProfile = async () => {

    try {

      const token =

        localStorage.getItem('accessToken');



      if (!token) {

        router.push('/');

        return;

      }

      const tokenUserId = getUserIdFromToken(token);

      console.log('User ID from JWT:', tokenUserId);



      console.log(

        'Settings API URL:',

        `${API_URL}/users/me`,

      );



      console.log(

        'Access token exists:',

        !!token,

      );



      const response = await fetch(

        `${API_URL}/users/me`,

        {

          method: 'GET',

          headers: {

            Authorization: `Bearer ${token}`,

            'Content-Type': 'application/json',

          },

        },

      );



      console.log(

        'GET /users/me status:',

        response.status,

      );



      const responseText =

        await response.text();



      console.log(

        'GET /users/me response:',

        responseText,

      );



      if (!response.ok) {

        throw new Error(

          `Profile request failed (${response.status}): ${responseText}`,

        );

      }



      const data = JSON.parse(responseText);



      console.log(

        'Profile data:',

        data,

      );



      const resolvedUserId = data.id ?? tokenUserId;

      if (!resolvedUserId) {
        throw new Error(
          'Unable to determine your user ID from the profile or login session.',
        );
      }

      const user: UserProfile = {
        id: resolvedUserId,

        name: data.name ?? '',

        email: data.email ?? '',

        role: data.role ?? '',

        isActive:

          data.isActive ?? true,

      };



      setProfile(user);



      localStorage.setItem(

        'user',

        JSON.stringify(user),

      );



      console.log(

        'Profile loaded successfully:',

        user,

      );

    } catch (error) {

      console.error(

        'Failed to load profile:',

        error,

      );



      /*

       * Try localStorage only as a fallback.

       */

      const storedUser =

        localStorage.getItem('user');



      if (storedUser) {

        try {

          const user =

            JSON.parse(storedUser);



          setProfile({

            id: user.id,

            name: user.name ?? '',

            email: user.email ?? '',

            role: user.role ?? '',

            isActive:

              user.isActive ?? true,

          });

        } catch (storageError) {

          console.error(

            'Invalid stored user:',

            storageError,

          );

        }

      }

    }

  };



  loadProfile();



  const storedSettings =

    localStorage.getItem(

      'settings',

    );



  if (storedSettings) {
    try {
      const parsedSettings = JSON.parse(storedSettings);

      setNotifications(parsedSettings.notifications ?? true);
      setEmailNotifications(parsedSettings.emailNotifications ?? false);
      setCompactMode(parsedSettings.compactMode ?? false);
    } catch {
      // Ignore invalid settings.
    }
  }

}, [router]);



  const handleProfileChange = (

    field: 'name' | 'email',

    value: string,

  ) => {

    setProfile((current) => ({

      ...current,

      [field]: value,

    }));



    setProfileError('');

    setProfileSuccess('');

  };



  const handleSaveProfile = async () => {

    setProfileError('');

    setProfileSuccess('');

    setSavingProfile(true);



    try {

      const token =

        localStorage.getItem('accessToken');



      if (!token) {

        throw new Error(

          'Your session has expired. Please sign in again.',

        );

      }



      const response = await fetch(

        `${API_URL}/users/me`,

        {

          method: 'PATCH',

          headers: {

            'Content-Type': 'application/json',

            Authorization: `Bearer ${token}`,

          },

          body: JSON.stringify({

            name: profile.name.trim(),

            email: profile.email.trim(),

          }),

        },

      );



      const data = await response.json();



      if (!response.ok) {

        throw new Error(

          Array.isArray(data?.message)

            ? data.message.join(', ')

            : data?.message ??

                'Unable to update your profile.',

        );

      }



      const updatedUser = {

        ...profile,

        ...data,

      };



      localStorage.setItem(

        'user',

        JSON.stringify(updatedUser),

      );



      setProfile({

        id: updatedUser.id,

        name: updatedUser.name ?? '',

        email: updatedUser.email ?? '',

        role: updatedUser.role ?? '',

        isActive:

          updatedUser.isActive ?? true,

      });



      setProfileSuccess(

        'Your profile has been updated successfully.',

      );

    } catch (error) {

      setProfileError(

        error instanceof Error

          ? error.message

          : 'something went wrong while updating your profile.',

      );

    } finally {

      setSavingProfile(false);

    }

  };



  const handleChangePassword = async () => {

    setPasswordError('');

    setPasswordSuccess('');



    if (!currentPassword) {

      setPasswordError(

        'Please enter your current password.',

      );

      return;

    }



    if (!newPassword) {

      setPasswordError(

        'Please enter a new password.',

      );

      return;

    }



    if (newPassword.length < 8) {

      setPasswordError(

        'Your new password must be at least 8 characters long.',

      );

      return;

    }



    if (!confirmPassword) {

      setPasswordError(

        'Please confirm your new password.',

      );

      return;

    }



    if (newPassword !== confirmPassword) {

      setPasswordError(

        'The new passwords do not match.',

      );

      return;

    }



    if (currentPassword === newPassword) {

      setPasswordError(

        'Your new password must be different from your current password.',

      );

      return;

    }



    try {

      const token =

        localStorage.getItem('accessToken');



      if (!token) {

        throw new Error(

          'Your session has expired. Please sign in again.',

        );

      }



      const tokenUserId = getUserIdFromToken(token);

      if (!tokenUserId) {
        throw new Error(
          'Your login session does not contain a valid user ID. Please sign in again.',
        );
      }

      setChangingPassword(true);

      const response = await fetch(
        `${API_URL}/users/${tokenUserId}/password`,

        {

          method: 'PATCH',

          headers: {

            'Content-Type': 'application/json',

            Authorization: `Bearer ${token}`,

          },

          body: JSON.stringify({

            currentPassword,

            newPassword,

          }),

        },

      );



      const data = await response.json();



      if (!response.ok) {

        throw new Error(

          Array.isArray(data?.message)

            ? data.message.join(', ')

            : data?.message ??

                'Unable to change your password.',

        );

      }



      setCurrentPassword('');

      setNewPassword('');

      setConfirmPassword('');



      setPasswordSuccess(

        'Your password has been changed successfully.',

      );

    } catch (error) {

      setPasswordError(

        error instanceof Error

          ? error.message

          : 'something went wrong while changing your password.',

      );

    } finally {

      setChangingPassword(false);

    }

  };



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

                  Manage your account and workspace

                  preferences.

                </p>

              </div>

            </div>

          </div>

        </div>



        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

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



          <section className="min-w-0">

            {activeSection === 'profile' && (

              <div className="space-y-5">

                <SettingsHeader

                  icon={UserRound}

                  title="Profile"

                  description="Manage your personal account information."

                />



                <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">

                  <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center">

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#39ff14]/15 bg-[#39ff14]/5 text-xl font-semibold text-[#39ff14]">

                      {profile.name

                        ? profile.name

                            .charAt(0)

                            .toUpperCase()

                        : 'U'}

                    </div>



                    <div>

                      <h2 className="font-semibold text-white">

                        {profile.name ||

                          'Your account'}

                      </h2>



                      <p className="mt-1 text-sm text-white/35">

                        {profile.email ||

                          'No email address'}

                      </p>

                    </div>



                    <div className="sm:ml-auto">

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

                    <div>

                      <label

                        htmlFor="profile-name"

                        className="mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-white/25"

                      >

                        Full name

                      </label>



                      <input

                        id="profile-name"

                        type="text"

                        value={profile.name}

                        onChange={(event) =>

                          handleProfileChange(

                            'name',

                            event.target.value,

                          )

                        }

                        placeholder="Enter your full name"

                        className="input"

                      />

                    </div>



                    <div>

                      <label

                        htmlFor="profile-email"

                        className="mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-white/25"

                      >

                        Email address

                      </label>



                      <input

                        id="profile-email"

                        type="email"

                        value={profile.email}

                        onChange={(event) =>

                          handleProfileChange(

                            'email',

                            event.target.value,

                          )

                        }

                        placeholder="Enter your email"

                        className="input"

                      />

                    </div>

                  </div>



                  <div className="mt-5 grid gap-5 md:grid-cols-2">

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



                    <InfoField

                      label="Account status"

                      value={

                        profile.isActive

                          ? 'Active'

                          : 'Inactive'

                      }

                    />

                  </div>



                  {profileError && (

                    <AlertBox

                      type="error"

                      message={profileError}

                    />

                  )}



                  {profileSuccess && (

                    <AlertBox

                      type="success"

                      message={profileSuccess}

                    />

                  )}



                  <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="text-sm font-medium text-white/80">

                        Account information

                      </p>



                      <p className="mt-1 text-xs text-white/30">

                        Changes are securely saved to your

                        account.

                      </p>

                    </div>



                    <button

                      type="button"

                      onClick={handleSaveProfile}

                      disabled={savingProfile}

                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#39ff14] px-5 text-sm font-semibold text-black transition hover:bg-[#50ff31] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"

                    >

                      {savingProfile ? (

                        <>

                          <Spinner />

                          Saving...

                        </>

                      ) : (

                        <>

                          <Save size={16} />

                          Save changes

                        </>

                      )}

                    </button>

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

                          Your access level is controlled by

                          your assigned role. Contact an

                          administrator if your permissions

                          need to be changed.

                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            )}



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

                        Change password

                      </h2>



                      <p className="mt-1 text-sm text-white/35">

                        Update your password to keep your

                        account secure.

                      </p>

                    </div>

                  </div>



                  <div className="mt-7 space-y-5">

                    <PasswordField

                      label="Current password"

                      value={currentPassword}

                      onChange={setCurrentPassword}

                      placeholder="Enter your current password"

                    />



                    <div>

                      <PasswordField

                        label="New password"

                        value={newPassword}

                        onChange={setNewPassword}

                        placeholder="Enter your new password"

                      />



                      {newPassword && (

                        <PasswordStrength

                          password={newPassword}

                        />

                      )}

                    </div>



                    <div>

                      <PasswordField

                        label="Confirm new password"

                        value={confirmPassword}

                        onChange={setConfirmPassword}

                        placeholder="Confirm your new password"

                      />



                      {confirmPassword &&

                        newPassword !==

                          confirmPassword && (

                          <p className="mt-2 text-xs text-red-300">

                            Passwords do not match.

                          </p>

                        )}



                      {confirmPassword &&

                        newPassword ===

                          confirmPassword && (

                          <p className="mt-2 flex items-center gap-1.5 text-xs text-[#39ff14]/80">

                            <Check size={13} />

                            Passwords match.

                          </p>

                        )}

                    </div>



                    {passwordError && (

                      <AlertBox

                        type="error"

                        message={passwordError}

                      />

                    )}



                    {passwordSuccess && (

                      <AlertBox

                        type="success"

                        message={passwordSuccess}

                      />

                    )}



                    <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <p className="text-sm font-medium text-white/70">

                          Password requirements

                        </p>



                        <p className="mt-1 text-xs text-white/30">

                          Minimum 8 characters. Use a strong,

                          unique password.

                        </p>

                      </div>



                      <button

                        type="button"

                        onClick={handleChangePassword}

                        disabled={changingPassword}

                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#39ff14] px-5 text-sm font-semibold text-black transition hover:bg-[#50ff31] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"

                      >

                        {changingPassword ? (

                          <>

                            <Spinner />

                            Updating...

                          </>

                        ) : (

                          <>

                            <LockKeyhole size={16} />

                            Update password

                          </>

                        )}

                      </button>

                    </div>

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

                        Use a strong password containing

                        uppercase letters, lowercase letters,

                        numbers and special characters. Avoid

                        reusing passwords from other services.

                      </p>

                    </div>

                  </div>

                </div>

              </div>

            )}



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

                      setNotifications(

                        !notifications,

                      )

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

                      setCompactMode(

                        !compactMode,

                      )

                    }

                  />

                </div>



                <div className="flex flex-col gap-4 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-sm font-medium text-white">

                      Save preferences

                    </p>



                    <p className="mt-1 text-xs text-white/30">

                      Your preferences are stored locally on

                      this device.

                    </p>

                  </div>



                  <button

                    type="button"

                    onClick={handleSavePreferences}

                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#39ff14] px-4 text-sm font-semibold text-black transition hover:bg-[#50ff31]"

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

                        A clean, modern workspace designed to

                        help teams organize responsibilities,

                        track progress and stay focused.

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

  value,

  onChange,

  placeholder,

}: {

  label: string;

  value: string;

  onChange: (value: string) => void;

  placeholder: string;

}) {

  return (

    <div>

      <label className="mb-2 block text-xs font-medium text-white/50">

        {label}

      </label>



      <input

        type="password"

        value={value}

        onChange={(event) =>

          onChange(event.target.value)

        }

        placeholder={placeholder}

        autoComplete="new-password"

        className="input"

      />

    </div>

  );

}



function PasswordStrength({

  password,

}: {

  password: string;

}) {

  const checks = {

    length: password.length >= 8,

    uppercase: /[A-Z]/.test(password),

    lowercase: /[a-z]/.test(password),

    number: /[0-9]/.test(password),

    special: /[^A-Za-z0-9]/.test(password),

  };



  const score = Object.values(checks).filter(

    Boolean,

  ).length;



  const label =

    score <= 2

      ? 'Weak'

      : score === 3

        ? 'Fair'

        : score === 4

          ? 'strong'

          : 'Very strong';



  return (

    <div className="mt-3 rounded-2xl border border-white/[0.05] bg-black/10 p-3">

      <div className="mb-2 flex items-center justify-between">

        <span className="text-[11px] uppercase tracking-[0.14em] text-white/25">

          Password strength

        </span>



        <span

          className={`text-xs ${

            score <= 2

              ? 'text-red-300'

              : score === 3

                ? 'text-yellow-300'

                : 'text-[#39ff14]'

          }`}

        >

          {label}

        </span>

      </div>



      <div className="flex gap-1">

        {[1, 2, 3, 4, 5].map((level) => (

          <div

            key={level}

            className={`h-1 flex-1 rounded-full transition ${

              level <= score

                ? 'bg-[#39ff14]'

                : 'bg-white/[0.07]'

            }`}

          />

        ))}

      </div>



      <div className="mt-3 grid gap-1.5 text-[11px] sm:grid-cols-2">

        <PasswordCheck

          valid={checks.length}

          label="At least 8 characters"

        />



        <PasswordCheck

          valid={checks.uppercase}

          label="Uppercase letter"

        />



        <PasswordCheck

          valid={checks.lowercase}

          label="Lowercase letter"

        />



        <PasswordCheck

          valid={checks.number}

          label="Number"

        />



        <PasswordCheck

          valid={checks.special}

          label="Special character"

        />

      </div>

    </div>

  );

}



function PasswordCheck({

  valid,

  label,

}: {

  valid: boolean;

  label: string;

}) {

  return (

    <div

      className={`flex items-center gap-2 ${

        valid ? 'text-[#39ff14]/80' : 'text-white/25'

      }`}

    >

      <span

        className={`flex h-4 w-4 items-center justify-center rounded-full ${

          valid

            ? 'bg-[#39ff14]/10'

            : 'bg-white/[0.04]'

        }`}

      >

        {valid && <Check size={10} />}

      </span>



      {label}

    </div>

  );

}



function AlertBox({

  type,

  message,

}: {

  type: 'error' | 'success';

  message: string;

}) {

  if (type === 'success') {

    return (

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#39ff14]/10 bg-[#39ff14]/[0.04] px-4 py-3">

        <Check

          size={17}

          className="shrink-0 text-[#39ff14]"

        />



        <p className="text-sm text-[#39ff14]/80">

          {message}

        </p>

      </div>

    );

  }



  return (

    <div className="mt-5 rounded-2xl border border-red-400/10 bg-red-400/[0.04] px-4 py-3">

      <p className="text-sm text-red-300">

        {message}

      </p>

    </div>

  );

}



function Spinner() {

  return (

    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />

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



