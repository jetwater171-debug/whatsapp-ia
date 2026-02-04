import type { Metadata } from "next";
import { Space_Grotesk, Instrument_Serif } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
});

export const metadata: Metadata = {
  title: "WhatsApp IA | Dashboard",
  description: "Plataforma de WhatsApp com IA para responder leads.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${spaceGrotesk.variable} ${instrumentSerif.variable} bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
