import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ajude AVA 🐱",
  description: "Doe via PIX e ajude nos cuidados de Ava",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gradient-to-br from-rose-50 via-rose-100 to-pink-200 flex items-center justify-center p-6">
        {children}
      </body>
    </html>
  );
}
