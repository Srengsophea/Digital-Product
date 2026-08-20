import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/CartContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { getSession } from "@/lib/auth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DIGI VIP — Premium Digital Product Marketplace",
    template: "%s · DIGI VIP",
  },
  description:
    "Curated premium digital products — software, design assets, courses and templates. Instant delivery with license keys and QR codes.",
  keywords: [
    "digital products",
    "software marketplace",
    "design assets",
    "courses",
    "templates",
    "license keys",
  ],
  openGraph: {
    title: "DIGI VIP — Premium Digital Product Marketplace",
    description:
      "Curated premium digital products delivered instantly with secure license keys.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html
      lang="en"
      data-theme="light"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head suppressHydrationWarning>
        {/* Apply saved theme BEFORE paint, defaulting strictly to light theme */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('digi_vip_theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`,
          }}
        />
        {/* Suppress third-party Chrome extension errors & strip extension DOM attributes */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){window.addEventListener("unhandledrejection",function(e){if(e.reason&&((e.reason.stack&&e.reason.stack.indexOf("chrome-extension://")!==-1)||(e.reason.message&&(e.reason.message.indexOf("M_ID")!==-1||e.reason.message.indexOf("RSC payload")!==-1)))){e.preventDefault();e.stopImmediatePropagation();}});window.addEventListener("error",function(e){if(e.filename&&e.filename.indexOf("chrome-extension://")!==-1){e.preventDefault();e.stopImmediatePropagation();}},true);var A=["bis_skin_checked","data-skin-checked","_processed","data-extension","data-lt-installed","data-vendor","bis_use","data-dynamic-id"];function c(){if(!document.documentElement)return;var e=document.querySelectorAll("["+A.join("], [")+"]");for(var i=0;i<e.length;i++){for(var j=0;j<A.length;j++){if(e[i].hasAttribute(A[j]))e[i].removeAttribute(A[j]);}}}if(document.readyState!=="loading"){c();}else{document.addEventListener("DOMContentLoaded",c);}setTimeout(c,10);setTimeout(c,100);setTimeout(c,500);new MutationObserver(c).observe(document.documentElement,{attributes:true,subtree:true,attributeFilter:A});})();`,
          }}
        />
      </head>
      <body className="relative min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <AnimatedBackground />
          <CartProvider>
            <Navbar
              user={
                session
                  ? {
                      id: session.sub,
                      name: session.name,
                      email: session.email,
                      role: session.role,
                    }
                  : null
              }
            />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
