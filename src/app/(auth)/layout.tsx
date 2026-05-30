import type { ReactNode } from "react";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--mz-surface) px-4 py-12">
      {children}
    </div>
  );
}
