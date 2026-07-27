import type {
  Coupon,
  CouponApplicableCategory,
} from "../types";

export type CheckoutDiscountSource = "none" | "automatic" | "coupon";

export type CheckoutDiscountDecision = {
  percentage: number;
  source: CheckoutDiscountSource;
};

export const getCouponPercentageForPaymentMethod = (
  coupon: Coupon | null,
  paymentMethod: "online" | "transfer"
): number => {
  if (!coupon) return 0;

  if (paymentMethod === "transfer") {
    return (
      coupon.porcentajeDescuentoTransferencia ??
      coupon.porcentajeDescuento
    );
  }

  return (
    coupon.porcentajeDescuentoTarjeta ??
    coupon.porcentajeDescuento
  );
};

const normalizePercentage = (percentage: number): number =>
  Number.isFinite(percentage)
    ? Math.min(Math.max(percentage, 0), 100)
    : 0;

export const selectCheckoutDiscount = ({
  automaticPercentage,
  couponPercentage,
}: {
  automaticPercentage: number;
  couponPercentage: number;
}): CheckoutDiscountDecision => {
  const automatic = normalizePercentage(automaticPercentage);
  const coupon = normalizePercentage(couponPercentage);

  if (coupon > automatic) {
    return { percentage: coupon, source: "coupon" };
  }

  if (automatic > 0) {
    return { percentage: automatic, source: "automatic" };
  }

  return { percentage: 0, source: "none" };
};

export const deriveCouponCategory = (
  productCategory: string
): CouponApplicableCategory => {
  const normalized = productCategory.trim().toUpperCase();

  if (
    normalized === "FILAMENTOS" ||
    normalized === "FILAMENTO 3D"
  ) {
    return "filamento";
  }

  if (normalized === "IMPRESORAS") {
    return "impresora";
  }

  return "repuesto";
};

export const isCouponApplicableToProductCategory = ({
  couponCategory,
  productCategory,
}: {
  couponCategory?: CouponApplicableCategory | null;
  productCategory: string;
}): boolean =>
  !couponCategory ||
  couponCategory === deriveCouponCategory(productCategory);
