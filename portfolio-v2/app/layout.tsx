import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anthony Immenschuh — Portfolio",
  description: "Personal portfolio and selected projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <style>{`
          html[data-theme="dark"],
          html[data-theme="dark"] body {
            background: #1f1e1b;
            color: #eae7e1;
            color-scheme: dark;
          }
        `}</style>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/thin/style.css"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
