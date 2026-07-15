"use client";

import { useEffect } from "react";

// Loads Google Translate's hidden widget. The visible control is our own
// LanguageMenu, which sets the `googtrans` cookie and reloads — the widget then
// translates the whole page into the chosen language.
export function GoogleTranslate() {
  useEffect(() => {
    if (document.getElementById("gt-script")) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).googleTranslateElementInit = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = (window as any).google;
      if (g?.translate?.TranslateElement) {
        new g.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          "google_translate_element",
        );
      }
    };

    const s = document.createElement("script");
    s.id = "gt-script";
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(s);
  }, []);

  return <div id="google_translate_element" aria-hidden className="sr-only" />;
}
