"use client";

import { Providers } from "./providers";
import "./globals.css";
import "./animations.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
