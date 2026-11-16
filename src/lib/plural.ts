// No imports: used by i18n and by unit tests.
/** Which plural form a count takes: RO uses "de" from 20 (and for x00), FR treats 0 as singular. */
export function pluralForm(n: number, lang: string): "one" | "few" | "many" {
  const m = n % 100;
  if (n === 1 || (lang === "fr" && n === 0)) return "one";
  return lang === "ro" && n !== 0 && (m === 0 || m >= 20) ? "many" : "few";
}
