import type { ReactNode } from "react";
import { Calendar, Mic, Phone, Bot } from "lucide-react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left: gradient illustration */}
      <div
        className="relative hidden flex-1 overflow-hidden p-10 lg:flex lg:flex-col lg:items-center lg:justify-center"
        style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
      >
        {/* Floating icons */}
        <Calendar className="absolute left-10 top-16 h-8 w-8 text-white/70" />
        <Mic className="absolute right-14 top-24 h-9 w-9 text-white/80" />
        <Phone className="absolute bottom-24 left-16 h-8 w-8 text-white/70" />
        <Bot className="absolute bottom-16 right-20 h-10 w-10 text-white/80" />

        {/* Illustration placeholder */}
        <div className="relative flex h-72 w-72 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm">
          <span className="px-6 text-center text-sm font-medium text-white/90">
            Ringo Illustration
          </span>
        </div>

        {/* Speech bubble */}
        <div className="relative mt-10 max-w-xs rounded-2xl bg-white px-5 py-3 shadow-modal">
          <p className="text-sm font-medium text-gray-800">
            Yes! I will attend the event.
          </p>
          <span className="absolute -top-2 left-8 h-4 w-4 rotate-45 bg-white" />
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-white/70">
            The new era of outbound calling
          </p>
        </div>
      </div>

      {/* Right: form card */}
      <div className="flex flex-1 items-center justify-center bg-white p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-modal">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
