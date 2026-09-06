import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shared/AppShell";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "DYNAMIS — Rural Credit & Enterprise Platform",
  description: "Two-sided platform connecting rural entrepreneurs with SCA officer approvals",
};

// layout.tsx intentionally stays a Server Component — font loading, metadata.
// Client-side chrome (sidebar, role switcher, role state) lives in AppShell.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="bg-[#090d16] text-slate-100 antialiased font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
