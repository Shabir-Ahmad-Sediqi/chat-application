// How to make animated gradient border 👇
// https://cruip-tutorials.vercel.app/animated-gradient-border/

import type { ReactNode } from 'react';

function BorderAnimatedContainer({ children }: { children?: ReactNode }) {
  return (
    <div
      className="w-full h-full rounded-2xl border border-transparent animate-border flex overflow-hidden"
      style={{
        background:
          "linear-gradient(45deg,var(--surface),var(--surface-muted) 50%,var(--surface)) padding-box, conic-gradient(from var(--border-angle), rgba(0,0,0,0) 80%, var(--primary) 86%, var(--primary-20) 90%, var(--primary) 94%, rgba(0,0,0,0)) border-box"
      }}
    >
      {children}
    </div>
  );
}
export default BorderAnimatedContainer;
