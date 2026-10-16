import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pausa MX — Chequeo de Cuotas",
  description: "Entiende una compra a meses antes de aceptarla. Tú decides.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-MX"><body>{children}</body></html>;
}
