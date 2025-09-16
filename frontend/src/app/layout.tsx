import React, { ReactNode } from "react";

export const metadata = {
  title: "Cola‑Link‑e‑Pronto",
  description: "Cole o link do vídeo e gere shorts prontos",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
          margin: 0,
          backgroundColor: "#f7f7f7",
          color: "#111",
        }}
      >
        {children}
      </body>
    </html>
  );
}