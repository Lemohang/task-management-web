import LoginForm from '@/components/auth/LoginForm';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020706]">
      {/* Ambient lighting */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-emerald-500/[0.07] blur-[140px]" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-emerald-950/40 blur-[140px]" />

      {/* Fine grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:64px_64px]" />

      {/* Main */}
      <div className="relative mx-auto flex min-h-screen max-w-[1440px] items-center px-5 py-8 sm:px-8 lg:px-12">

        <div className="grid w-full overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#07110e]/80 shadow-[0_40px_120px_rgba(0,0,0,.45)] backdrop-blur-2xl lg:min-h-[760px] lg:grid-cols-[1.08fr_.92fr]">

          {/* Brand panel */}
          <section className="relative hidden overflow-hidden lg:block">

            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(16,185,129,.22),transparent_34%),radial-gradient(circle_at_80%_80%,rgba(6,78,59,.5),transparent_40%),linear-gradient(135deg,#063c2e_0%,#03251d_48%,#020706_100%)]" />

            {/* Decorative line */}
            <div className="absolute left-16 top-0 h-full w-px bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent" />

            {/* Logo */}
            <div className="absolute left-16 top-14 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-300/10">
                <span className="text-lg font-black text-emerald-300">
                  M
                </span>
              </div>

              <div>
                <div className="text-[17px] font-bold tracking-tight text-white">
                  MPlug
                </div>

                <div className="text-[9px] font-semibold uppercase tracking-[.3em] text-emerald-300/50">
                  Workspace
                </div>
              </div>

            </div>

            {/* Content */}
            <div className="absolute bottom-16 left-16 right-16">

              <div className="mb-7 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.25em] text-emerald-300/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                MPlug Team
              </div>

              <h1 className="max-w-xl text-[58px] font-semibold leading-[.98] tracking-[-.045em] text-white">
                Work with
                <br />
                <span className="text-emerald-300">
                  clarity.
                </span>
                <br />
                Move with
                <br />
                <span className="text-white/40">
                  purpose.
                </span>
              </h1>

              <p className="mt-8 max-w-md text-[14px] leading-7 text-white/45">
                A focused workspace for the MPlug
                team to turn ideas, responsibilities
                and projects into meaningful progress.
              </p>

              {/* Bottom details */}
              <div className="mt-12 flex items-center gap-8 border-t border-white/[0.08] pt-6">

                <div>
                  <p className="text-xs font-semibold text-white/70">
                    Tasks
                  </p>
                  <p className="mt-1 text-[11px] text-white/30">
                    Organize
                  </p>
                </div>

                <div className="h-7 w-px bg-white/10" />

                <div>
                  <p className="text-xs font-semibold text-white/70">
                    Team
                  </p>
                  <p className="mt-1 text-[11px] text-white/30">
                    Collaborate
                  </p>
                </div>

                <div className="h-7 w-px bg-white/10" />

                <div>
                  <p className="text-xs font-semibold text-white/70">
                    Progress
                  </p>
                  <p className="mt-1 text-[11px] text-white/30">
                    Deliver
                  </p>
                </div>

              </div>

            </div>

          </section>

          {/* Login panel */}
          <section className="flex min-h-[700px] items-center justify-center px-7 py-14 sm:px-14">

            <div className="w-full max-w-[390px]">

              {/* Mobile logo */}
              <div className="mb-14 flex items-center gap-3 lg:hidden">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-lg font-black text-emerald-400">
                  M
                </div>

                <div>
                  <div className="text-sm font-bold">
                    MPlug
                  </div>

                  <div className="text-[9px] uppercase tracking-[.25em] text-white/30">
                    Workspace
                  </div>
                </div>

              </div>

              <div className="mb-10">

                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[.25em] text-emerald-400">
                  Welcome back
                </p>

                <h2 className="text-[32px] font-semibold tracking-[-.03em] text-white">
                  Sign in
                </h2>

                <p className="mt-3 text-[13px] leading-6 text-white/35">
                  Access your MPlug workspace and
                  keep the team moving.
                </p>

              </div>

              <LoginForm />

              <div className="mt-10 flex items-center justify-between border-t border-white/[0.06] pt-6">

                <span className="text-[10px] uppercase tracking-[.2em] text-white/20">
                  MPlug
                </span>

                <span className="text-[10px] text-white/20">
                  Internal workspace
                </span>

              </div>

            </div>

          </section>

        </div>

      </div>
    </main>
  );
}