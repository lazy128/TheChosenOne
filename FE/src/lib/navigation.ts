import type { AnyRouter } from "@tanstack/react-router";

/** SPA-safe back: use router history when possible, else fall back to home. */
export function goBackOrHome(router: AnyRouter, fallbackTo = "/" as const) {
  if (router.history.length > 1) {
    router.history.back();
    return;
  }
  router.navigate({ to: fallbackTo });
}

type BrowseDispatch = { type: "GO_BROWSE" } | { type: "RESET" };

/** Sau thanh toán xong — về trang chọn phim, state sạch. */
export function startNewBooking(dispatch: (action: { type: "RESET" }) => void) {
  dispatch({ type: "RESET" });
  window.dispatchEvent(new CustomEvent("cinemax:new-booking"));
  window.dispatchEvent(new CustomEvent("cinemax:set-tab", { detail: "Now Showing" }));
  if (typeof window !== "undefined") {
    window.history.replaceState(null, "", "#now-showing");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/** Scroll to movie list and open Now Showing (works from any booking stage). */
export function goToNowShowing(dispatch?: (action: BrowseDispatch) => void, stage?: string) {
  if (stage && stage !== "browse") {
    dispatch?.({ type: "GO_BROWSE" });
  }
  window.dispatchEvent(new CustomEvent("cinemax:set-tab", { detail: "Now Showing" }));
  if (typeof window !== "undefined") {
    window.history.replaceState(null, "", "#now-showing");
  }
  scrollToHash("#now-showing");
}

export function scrollToHash(hash: string, retries = 10) {
  const id = hash.replace(/^#/, "");
  if (!id) return;
  const attempt = (left: number) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (left > 0) requestAnimationFrame(() => attempt(left - 1));
  };
  requestAnimationFrame(() => attempt(retries));
}
