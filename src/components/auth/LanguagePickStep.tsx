"use client";

import React, { useState, useEffect } from "react";
import { getLanguage, setLanguage, AppLanguage } from "@/lib/language";
import type { Role } from "@/components/shared/AppShell";

interface LanguagePickStepProps {
  role: Role;
  mobile: string;
  onContinue: (lang: AppLanguage) => void;
}

const LANGUAGES: { id: AppLanguage; native: string; english: string }[] = [
  { id: "en", native: "English", english: "" },
  { id: "ta", native: "தமிழ்", english: "Tamil" },
  { id: "hi", native: "हिन्दी", english: "Hindi" },
];

export function LanguagePickStep({ onContinue }: LanguagePickStepProps) {
  const [selected, setSelected] = useState<AppLanguage>("en");

  useEffect(() => {
    setSelected(getLanguage());
  }, []);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setLanguage(selected);
    onContinue(selected);
  };

  return (
    <div className="app-card w-full max-w-lg mx-auto px-8 py-10 md:px-10 md:py-12 relative z-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-main">Choose your language</h2>
        <p className="text-sm text-muted mt-2">
          Full translation is coming soon. You can change this later.
        </p>
      </div>

      <form onSubmit={handleContinue} className="space-y-6">
        <div className="space-y-3" role="radiogroup" aria-label="Language selection">
          {LANGUAGES.map((lang) => {
            const isChecked = selected === lang.id;
            return (
              <label
                key={lang.id}
                className={`
                  flex items-center justify-between p-4 min-h-[56px] rounded-xl border-2 cursor-pointer transition-all
                  ${
                    isChecked
                      ? "border-accent-strong bg-accent-subtle shadow-sm"
                      : "border-border-default bg-surface hover:bg-surface-subtle"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="language"
                    value={lang.id}
                    checked={isChecked}
                    onChange={() => setSelected(lang.id)}
                    className="w-4 h-4 text-accent-strong border-border-strong focus:ring-accent-strong accent-accent-strong"
                  />
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-main">{lang.native}</span>
                    {lang.english && (
                      <span className="text-xs text-muted">{lang.english}</span>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        <button
          type="submit"
          className="w-full min-h-[48px] btn-primary font-semibold text-base rounded-xl transition-all shadow-sm"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
