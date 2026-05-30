import { useCallback } from "react";
import { useLocale } from "@/context/LocaleContext";
import { formatMoney } from "@/lib/currency";

export function useFormatMoney() {
  const { locale } = useLocale();
  const format = useCallback((usd: number) => formatMoney(usd, locale), [locale]);
  return { format, locale, currency: locale === "vi" ? "VND" : "USD" };
}
