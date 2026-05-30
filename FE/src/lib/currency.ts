import type { Locale } from "@/context/LocaleContext";

/** Base ticket prices in data are stored as VND. */
export const USD_TO_VND = 25_400;

export function toDisplayAmount(baseVND: number, locale: Locale): number {
  return locale === "vi" ? baseVND : baseVND / USD_TO_VND;
}

export function formatMoney(baseVND: number, locale: Locale): string {
  const amount = toDisplayAmount(baseVND, locale);
  if (locale === "vi") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
