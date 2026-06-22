import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left: geometric abstract illustration */}
      <div
        className="relative hidden flex-1 overflow-hidden p-10 lg:flex lg:flex-col lg:items-center lg:justify-center"
        style={{ background: "linear-gradient(145deg, #9333ea 0%, #6d28d9 55%, #4c1d95 100%)" }}
      >
        {/* Subtle grid overlay */}
        <svg className="absolute inset-0 h-full w-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Main geometric illustration */}
        <div className="relative z-10">
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[280px] w-[280px]">
            {/* Decorative rings */}
            <circle cx="150" cy="150" r="138" stroke="white" strokeOpacity="0.07" strokeWidth="1" />
            <circle cx="150" cy="150" r="115" stroke="white" strokeOpacity="0.10" strokeWidth="1" />
            <circle cx="150" cy="150" r="90"  stroke="white" strokeOpacity="0.15" strokeWidth="1" />

            {/* Pulse rings around hub */}
            <circle cx="150" cy="150" r="62" stroke="white" strokeOpacity="0.10" strokeWidth="6" />
            <circle cx="150" cy="150" r="72" stroke="white" strokeOpacity="0.06" strokeWidth="3" />

            {/* Center hub */}
            <circle cx="150" cy="150" r="52" fill="white" fillOpacity="0.12" />
            <circle cx="150" cy="150" r="52" stroke="white" strokeOpacity="0.45" strokeWidth="1.5" />

            {/* Phone icon (Lucide Phone path, scaled to fit hub) */}
            <g transform="translate(134,134) scale(1.33)" stroke="none">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38a2 2 0 0 1 2-2.18H7a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                fill="white" fillOpacity="0.92" />
            </g>

            {/* ── Contact node 1 — Top (150, 33) confirmed ── */}
            <line x1="150" y1="102" x2="150" y2="49" stroke="white" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="150" cy="33" r="16" fill="white" fillOpacity="0.18" stroke="white" strokeOpacity="0.40" strokeWidth="1.5" />
            <text x="150" y="38.5" textAnchor="middle" fill="white" fillOpacity="0.9" fontSize="12" fontWeight="700">ก</text>
            <circle cx="162" cy="22" r="9" fill="#4ade80" fillOpacity="0.90" />
            <path d="M158 22.5L161 25.5L167 19.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

            {/* ── Contact node 2 — Top-right (263, 113) confirmed ── */}
            <line x1="196" y1="133" x2="247" y2="116" stroke="white" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="263" cy="113" r="16" fill="white" fillOpacity="0.18" stroke="white" strokeOpacity="0.40" strokeWidth="1.5" />
            <text x="263" y="118.5" textAnchor="middle" fill="white" fillOpacity="0.9" fontSize="12" fontWeight="700">ข</text>
            <circle cx="275" cy="102" r="9" fill="#4ade80" fillOpacity="0.90" />
            <path d="M271 102.5L274 105.5L280 99.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

            {/* ── Contact node 3 — Bottom-right (220, 247) pending ── */}
            <line x1="178" y1="190" x2="210" y2="234" stroke="white" strokeOpacity="0.14" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="220" cy="247" r="16" fill="white" fillOpacity="0.10" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="220" y="252.5" textAnchor="middle" fill="white" fillOpacity="0.55" fontSize="12" fontWeight="700">ค</text>

            {/* ── Contact node 4 — Bottom-left (80, 247) confirmed ── */}
            <line x1="122" y1="190" x2="90" y2="234" stroke="white" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="80" cy="247" r="16" fill="white" fillOpacity="0.18" stroke="white" strokeOpacity="0.40" strokeWidth="1.5" />
            <text x="80" y="252.5" textAnchor="middle" fill="white" fillOpacity="0.9" fontSize="12" fontWeight="700">ง</text>
            <circle cx="68" cy="236" r="9" fill="#4ade80" fillOpacity="0.90" />
            <path d="M64 236.5L67 239.5L73 233.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

            {/* ── Contact node 5 — Top-left (37, 113) confirmed ── */}
            <line x1="104" y1="133" x2="53" y2="116" stroke="white" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="37" cy="113" r="16" fill="white" fillOpacity="0.18" stroke="white" strokeOpacity="0.40" strokeWidth="1.5" />
            <text x="37" y="118.5" textAnchor="middle" fill="white" fillOpacity="0.9" fontSize="12" fontWeight="700">จ</text>
            <circle cx="25" cy="102" r="9" fill="#4ade80" fillOpacity="0.90" />
            <path d="M21 102.5L24 105.5L30 99.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

            {/* Accent dots on outer ring */}
            <circle cx="150" cy="12"  r="3" fill="white" fillOpacity="0.30" />
            <circle cx="288" cy="150" r="3" fill="white" fillOpacity="0.30" />
            <circle cx="12"  cy="150" r="3" fill="white" fillOpacity="0.30" />
            <circle cx="267" cy="233" r="2.5" fill="white" fillOpacity="0.20" />
            <circle cx="33"  cy="233" r="2.5" fill="white" fillOpacity="0.20" />
          </svg>
        </div>

        {/* Speech bubble */}
        <div className="relative z-10 mt-8 max-w-xs rounded-2xl bg-white px-5 py-3 shadow-modal">
          <p className="text-sm font-medium text-gray-800">ยืนยันครับ ผมจะมาร่วมงาน ✅</p>
          <span className="absolute -top-2 left-8 h-4 w-4 rotate-45 bg-white" />
        </div>

        <div className="absolute bottom-8 left-0 right-0 z-10 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-white/60">
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
