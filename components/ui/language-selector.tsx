"use client";

import { useState } from "react";
import { LOCALES, Locale } from "@/lib/i18n/translations";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value as Locale;
    setCurrentLocale(nextLocale);
    // Store in cookie/localStorage if needed for client persistence
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
  };

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Globe className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
      <select
        value={currentLocale}
        onChange={handleChange}
        aria-label="Select language"
        className="rounded-md border border-slate-200 bg-transparent px-2 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
      >
        {LOCALES.map((loc) => (
          <option key={loc.code} value={loc.code}>
            {loc.nativeName} ({loc.label})
          </option>
        ))}
      </select>
    </div>
  );
}
