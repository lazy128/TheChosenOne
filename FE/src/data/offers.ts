import type { Messages } from "@/i18n/locales/en";

export type OfferCategory = "all" | "membership" | "student" | "flash" | "combo";

export type OfferAccent = "blood" | "gold" | "ice" | "ember";

export type OfferId =
  | "reel10"
  | "student30"
  | "vip15"
  | "duodate"
  | "midnight"
  | "imaxweek"
  | "welcome"
  | "combo15";

export type OfferMeta = {
  id: OfferId;
  code: string;
  discountLabel: string;
  discountPercent: number;
  category: Exclude<OfferCategory, "all">;
  badge?: "HOT" | "NEW" | "VIP" | "LIMITED";
  accent: OfferAccent;
  featured?: boolean;
};

export type LocalizedOffer = OfferMeta & {
  title: string;
  tagline: string;
  description: string;
  validUntil: string;
  terms: string[];
};

export const OFFER_METAS: OfferMeta[] = [
  { id: "reel10", code: "REEL10", discountLabel: "−10%", discountPercent: 10, category: "flash", badge: "HOT", accent: "blood", featured: true },
  { id: "student30", code: "STUDENT30", discountLabel: "−30%", discountPercent: 30, category: "student", badge: "NEW", accent: "ice" },
  { id: "vip15", code: "CINEMAXVIP", discountLabel: "−15%", discountPercent: 15, category: "membership", badge: "VIP", accent: "gold" },
  { id: "duodate", code: "DUODATE", discountLabel: "−20%", discountPercent: 20, category: "combo", accent: "ember" },
  { id: "midnight", code: "MIDNIGHT", discountLabel: "−25%", discountPercent: 25, category: "flash", badge: "LIMITED", accent: "ice" },
  { id: "imaxweek", code: "IMAXWEEK", discountLabel: "−15%", discountPercent: 15, category: "flash", accent: "blood" },
  { id: "welcome", code: "WELCOME20", discountLabel: "−20%", discountPercent: 20, category: "membership", badge: "NEW", accent: "gold" },
  { id: "combo15", code: "COMBO15", discountLabel: "−15%", discountPercent: 15, category: "combo", accent: "ember" },
];

export const OFFER_CATEGORY_IDS: OfferCategory[] = ["all", "flash", "student", "membership", "combo"];

export function localizeOffers(items: Messages["offers"]["items"]): LocalizedOffer[] {
  return OFFER_METAS.map((meta) => {
    const copy = items[meta.id];
    return { ...meta, ...copy };
  });
}

const PROMO_MAP = new Map(OFFER_METAS.map((o) => [o.code.toUpperCase(), o]));

export function getOfferMetaByCode(code: string): OfferMeta | undefined {
  return PROMO_MAP.get(code.trim().toUpperCase());
}

export function formatPromoSuccess(
  code: string,
  discountLabel: string,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  return t("checkout.promoApplied", { code, discount: discountLabel });
}
