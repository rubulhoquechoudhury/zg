import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Photo Mosaic Generator",
  description: "Create beautiful photo mosaics from your images",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
