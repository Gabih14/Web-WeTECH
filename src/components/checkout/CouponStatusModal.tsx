import { useEffect } from "react";
import { Tag, X } from "lucide-react";
import type { CouponValidationFailure } from "../../services/api";
import {
  formatCouponDate,
  getCouponCategoryLabel,
} from "../../utils/couponPresentation";

type Props = {
  couponCode: string;
  issue: CouponValidationFailure;
  onContinueWithoutCoupon: () => void;
  onUseAnotherCoupon: () => void;
};

const whatsappUrl = (couponCode: string, issue: CouponValidationFailure) => {
  const message = issue.code === "COUPON_ALREADY_USED"
    ? `Hola, quise usar el cupón ${couponCode} en la web y me dice que ya fue usado.`
    : `Hola, tengo una duda con el cupón ${couponCode} en la web.`;
  return `https://wa.me/5492615987988?text=${encodeURIComponent(message)}`;
};

const CouponDataLine = ({ issue }: { issue: CouponValidationFailure }) => {
  if (issue.code === "COUPON_ALREADY_USED") {
    const date = formatCouponDate(issue.details?.fechaUso);
    const order = issue.details?.pedidoId;
    if (!date && (order === null || order === undefined)) return null;

    return (
      <p className="rounded-lg bg-gray-100 px-3 py-2 text-[15px] font-semibold leading-5 text-gray-900">
        {date ? `Usado el ${date}` : "Cupón usado"}
        {order !== null && order !== undefined ? ` · pedido #${order}` : ""}
      </p>
    );
  }

  if (issue.code === "COUPON_EXPIRED") {
    return (
      <p className="rounded-lg bg-gray-100 px-3 py-2 text-[15px] font-semibold leading-5 text-gray-900">
        Los cupones valen 15 días desde la compra.
      </p>
    );
  }

  return null;
};

const contentFor = (
  couponCode: string,
  issue: CouponValidationFailure
): { title: string; body: string; help: string } => {
  const code = couponCode || "ingresado";
  switch (issue.code) {
    case "COUPON_ALREADY_USED":
      return {
        title: "Este cupón ya fue usado",
        body: `El cupón ${code} es de un solo uso y ya se aplicó en una compra anterior. No se puede volver a usar.`,
        help: "¿Creés que no lo usaste? Escribinos por WhatsApp",
      };
    case "COUPON_EXPIRED": {
      const expiration = formatCouponDate(issue.details?.fechaVencimiento);
      return {
        title: "Este cupón está vencido",
        body: expiration
          ? `El cupón ${code} venció el ${expiration}. Ya no se puede usar.`
          : `El cupón ${code} está vencido. Ya no se puede usar.`,
        help: "¿Tenés una duda? Escribinos por WhatsApp",
      };
    }
    case "COUPON_NOT_APPLICABLE":
      return {
        title: "Este cupón no aplica a tu carrito",
        body: issue.details?.categoriaAplicable
          ? `El cupón ${code} es para ${getCouponCategoryLabel(issue.details.categoriaAplicable)}.`
          : `El cupón ${code} no aplica a los productos de tu carrito.`,
        help: "¿Tenés una duda? Escribinos por WhatsApp",
      };
    case "COUPON_OWNER_MISMATCH":
      return {
        title: "Este cupón está a nombre de otro cliente",
        body: `El cupón ${code} solo lo puede usar la persona a la que se lo dimos.`,
        help: "¿Tenés una duda? Escribinos por WhatsApp",
      };
    case "COUPON_NOT_FOUND":
    default:
      return {
        title: "No encontramos ese cupón",
        body: `Revisá que el código esté bien escrito: ${code}.`,
        help: "¿Tenés una duda? Escribinos por WhatsApp",
      };
  }
};

export const CouponStatusModal = ({
  couponCode,
  issue,
  onContinueWithoutCoupon,
  onUseAnotherCoupon,
}: Props) => {
  const content = contentFor(couponCode, issue);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onUseAnotherCoupon();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onUseAnotherCoupon]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-3"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onUseAnotherCoupon();
      }}
    >
      <section
        className="w-full max-w-[390px] rounded-2xl bg-white px-4 py-4 text-gray-950 shadow-2xl sm:px-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-status-title"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-gray-950">
            <Tag size={22} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="coupon-status-title" className="pr-7 text-[19px] font-bold leading-6">
              {content.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onUseAnotherCoupon}
            className="-ml-9 rounded-full p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
            aria-label="Cerrar y usar otro cupón"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-3 space-y-2.5 text-[16px] leading-[22px] text-gray-800">
          <p>
            {content.body.split(couponCode).map((part, index, parts) => (
              <span key={`${part}-${index}`}>
                {part}
                {index < parts.length - 1 && <strong className="font-mono text-gray-950">{couponCode}</strong>}
              </span>
            ))}
          </p>
          <CouponDataLine issue={issue} />
          <p>Podés seguir con tu compra sin el cupón.</p>
        </div>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={onContinueWithoutCoupon}
            className="min-h-11 w-full rounded-lg bg-gray-950 px-4 text-[15px] font-bold text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
          >
            Seguir sin cupón
          </button>
          <button
            type="button"
            onClick={onUseAnotherCoupon}
            className="min-h-11 w-full rounded-lg border-2 border-gray-950 bg-white px-4 text-[15px] font-bold text-gray-950 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
          >
            Usar otro cupón
          </button>
        </div>

        <a
          href={whatsappUrl(couponCode, issue)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block text-center text-[14px] font-semibold leading-5 text-gray-800 underline decoration-yellow-500 decoration-2 underline-offset-2"
        >
          {content.help}
        </a>
      </section>
    </div>
  );
};
