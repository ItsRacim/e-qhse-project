import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import PwaRegister from "@/components/PwaRegister";
import { LanguageProvider } from "@/lib/i18n/language-context";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "E-QHSE Platform",
    template: "%s · E-QHSE",
  },
  description: "Quality, Health, Safety and Environment management platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "E-QHSE",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon-192.png",
    apple: [{ url: "/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

const themeInitScript = `
(function () {
  try {
    localStorage.setItem("theme", "light");
    document.documentElement.classList.remove("dark");
  } catch (e) {}
})();
`;

const languageInitScript = `
(function () {
  try {
    var lang = localStorage.getItem("eqhse-language") || "en";
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: languageInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <LanguageProvider>
          {children}
          <PwaRegister />
        </LanguageProvider>
      </body>
    </html>
  );
}