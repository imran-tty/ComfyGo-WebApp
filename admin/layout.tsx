import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — ComfyGo",
  description: "ComfyGo admin dashboard",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
