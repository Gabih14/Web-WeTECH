export const COUPON_QUERY_PARAM = "cupon";
export const COUPON_SESSION_STORAGE_KEY = "checkoutCouponCode";

type CouponStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function normalizeCouponCode(
  couponCode: string | null | undefined
): string {
  return couponCode?.trim().toUpperCase() ?? "";
}

export function getCouponCodeFromSearch(search: string): string {
  const searchParams = new URLSearchParams(search);
  return normalizeCouponCode(searchParams.get(COUPON_QUERY_PARAM));
}

export function readStoredCoupon(storage: CouponStorage): string {
  try {
    return normalizeCouponCode(storage.getItem(COUPON_SESSION_STORAGE_KEY));
  } catch (error) {
    console.warn("No se pudo leer el cupón guardado para el checkout.", error);
    return "";
  }
}

export function captureCouponFromSearch(
  search: string,
  storage: CouponStorage
): string {
  const couponCode = getCouponCodeFromSearch(search);

  if (!couponCode) {
    return "";
  }

  try {
    storage.setItem(COUPON_SESSION_STORAGE_KEY, couponCode);
  } catch (error) {
    console.warn("No se pudo guardar el cupón para el checkout.", error);
  }

  return couponCode;
}

export function clearStoredCoupon(storage: CouponStorage): void {
  try {
    storage.removeItem(COUPON_SESSION_STORAGE_KEY);
  } catch (error) {
    console.warn("No se pudo borrar el cupón guardado del checkout.", error);
  }
}
