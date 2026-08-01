import type { Metadata } from "next";
import Header from "@/components/Header";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestión de Cabañas",
  description: "Sistema interno de gestión de reservas para alquiler temporario de cabañas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-ink text-cream antialiased">
        <ToastProvider>
          <Header />
          <main>{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
