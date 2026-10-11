/**
 * DYNAMIS — Number & Currency Formatting Helpers
 * Pure functions, no React, no side effects.
 */

/**
 * Formats a number in Indian currency style without decimals.
 * e.g. 315000 -> "₹3,15,000"
 */
export function formatINR(n: number): string {
  if (!isFinite(n)) return "₹0";
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

/**
 * Formats a number in lakh representation for values >= 1,00,000 (max 1 decimal, dropping trailing .0),
 * or falls back to formatINR for values < 1,00,000.
 * e.g. 350000 -> "₹3.5 lakh", 300000 -> "₹3 lakh", 45000 -> "₹45,000"
 */
export function formatLakh(n: number): string {
  if (!isFinite(n)) return "₹0";
  if (Math.abs(n) >= 100_000) {
    const inLakhs = n / 100_000;
    const formatted = inLakhs.toFixed(1).replace(/\.0$/, "");
    return `₹${formatted} lakh`;
  }
  return formatINR(n);
}

/**
 * Formats a number rounded to 2 significant figures in Indian grouping style.
 * e.g. 45200 -> "about 45,000", 9 -> "about 9", 1234567 -> "about 12,00,000"
 */
export function formatApprox(n: number): string {
  if (!isFinite(n) || n === 0) return "about 0";
  const rounded = Number(n.toPrecision(2));
  return `about ${rounded.toLocaleString("en-IN")}`;
}
