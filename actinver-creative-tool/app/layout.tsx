import type { Metadata } from "next";
import { Poppins, Open_Sans, Bad_Script } from "next/font/google";
import "./globals.css";

// Tipografía primaria Actinver (brandbook p.41)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

// Script cursiva — usada únicamente en "Fundador" de la insignia (Actinver 1.0)
const badScript = Bad_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bad-script",
  display: "swap",
});

// Tipografía secundaria web (brandbook p.43)
const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Actinver Creative Tool",
  description: "Generador de piezas de social media para Actinver / DINN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} ${openSans.variable} ${badScript.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
