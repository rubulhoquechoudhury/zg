import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "./components/Toast";

export const metadata: Metadata = {
  title: "Image Gallery Composer",
  description: "Upload images and create beautiful gallery compositions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
