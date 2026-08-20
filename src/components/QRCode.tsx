"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QRCodeSVG({ secret, size = 96 }: { secret: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    // Use theme-aware colors: dark QR on light background in light mode,
    // light QR on dark background in dark mode.
    const theme = document.documentElement.getAttribute("data-theme") ?? "light";
    const dark = theme === "dark" ? "#f3f0ff" : "#171130";
    const light = theme === "dark" ? "#0b0719" : "#ffffff";

    QRCode.toDataURL(secret, {
      width: size * 2,
      margin: 1,
      color: { dark, light },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [secret, size]);

  if (!dataUrl) {
    return <div style={{ width: size, height: size }} className="animate-pulse rounded" />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="License QR code" width={size} height={size} className="rounded" />;
}
