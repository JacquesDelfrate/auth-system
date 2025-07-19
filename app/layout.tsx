import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/NavBar";

export const metadata: Metadata = {
  title: "Auth System",
  description: "User authentication system built with Next.js",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <body className="antialiased">
        <NavBar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}