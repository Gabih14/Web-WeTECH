import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { apiFetch } from "../services/api";

const PaymentStatus = {
  LOADING: "loading",
  SUCCESS: "success",
  FAIL: "fail",
};

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}

interface PedidoData {
  id: number;
  cliente_cuit: string;
  cliente_nombre: string;
  external_id: string;
  total: number;
  estado: string;
  productos: Producto[];
  creado: string;
  aprobado: string | null;
  costo_envio?: string;
  descuento_cupon?: string;
  codigo_cupon?: string;
  delivery_method?: string;
  cliente_mail?: string;
  cliente_ubicacion?: string;
  observaciones_direccion?: string | null;
  payment_method?: string;
  metodo_pago?: string;
  comprobante_numero?: string;
}

const PaymentCallback = () => {
  const [status, setStatus] = useState(PaymentStatus.LOADING);
  const [searchParams] = useSearchParams();
  const [pedidoData, setPedidoData] = useState<PedidoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Controla la animación de pantalla completa
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashExiting, setSplashExiting] = useState(false);

  const paymentMethod = pedidoData?.payment_method ?? pedidoData?.metodo_pago;
  const isTransferPending =
    paymentMethod === "transfer" && pedidoData?.estado === "PENDIENTE";

  const externalId =
    searchParams.get("external_id") ||
    searchParams.get("order_id") ||
    searchParams.get("id") ||
    searchParams.get("payment_id") ||
    searchParams.get("preference_id") ||
    searchParams.get("collection_id");

  // Inyectar estilos de animación
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:ital,wght@0,700;1,400&display=swap');

      * { box-sizing: border-box; }

      .pago-root {
        font-family: 'DM Sans', sans-serif;
        min-height: 100vh;
        background: #f7f5f2;
      }

      /* ── SPLASH ── */
      .splash {
        position: fixed; inset: 0; z-index: 100;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 20px;
        transition: opacity 0.7s ease, transform 0.7s ease;
      }
      .splash.exiting {
        opacity: 0;
        transform: scale(1.06);
        pointer-events: none;
      }
      .splash-loading { background: #f0f6ff; }
      .splash-success { background: #22c55e; }
      .splash-fail    { background: #ef4444; }

      .splash-icon {
        width: 88px; height: 88px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        animation: pop 0.5s cubic-bezier(.34,1.56,.64,1) both;
      }
      .splash-loading .splash-icon { background: #dbeafe; }
      .splash-success .splash-icon { background: rgba(255,255,255,0.25); }
      .splash-fail    .splash-icon { background: rgba(255,255,255,0.25); }

      .splash-text {
        font-family: 'Fraunces', serif;
        font-size: 2rem; font-weight: 700;
        text-align: center; padding: 0 24px;
        animation: fadeUp 0.6s 0.2s both;
      }
      .splash-loading .splash-text { color: #1e40af; }
      .splash-success .splash-text { color: #fff; }
      .splash-fail    .splash-text { color: #fff; }

      .splash-sub {
        font-size: 1rem; opacity: 0.85; text-align: center; padding: 0 24px;
        animation: fadeUp 0.6s 0.35s both;
      }
      .splash-loading .splash-sub { color: #3b82f6; }
      .splash-success .splash-sub { color: rgba(255,255,255,0.9); }
      .splash-fail    .splash-sub  { color: rgba(255,255,255,0.9); }

      /* Spinner inside splash */
      .splash-spinner {
        width: 48px; height: 48px;
        border: 4px solid #93c5fd;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 0.9s linear infinite;
      }

      /* ── CONTENT ── */
      .content-wrap {
        max-width: 520px; margin: 0 auto;
        padding: 40px 20px 60px;
        animation: fadeUp 0.5s 0.1s both;
      }

      .status-badge {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 6px 16px; border-radius: 999px;
        font-size: 0.8rem; font-weight: 600; letter-spacing: 0.05em;
        text-transform: uppercase; margin-bottom: 12px;
      }
      .badge-success { background: #dcfce7; color: #16a34a; }
      .badge-fail    { background: #fee2e2; color: #dc2626; }
      .badge-loading { background: #dbeafe; color: #2563eb; }

      .page-title {
        font-family: 'Fraunces', serif;
        font-size: 1.75rem; font-weight: 700; line-height: 1.2;
        color: #111; margin: 0 0 6px;
      }
      .page-sub {
        color: #6b7280; font-size: 0.95rem; margin: 0 0 28px;
      }

      .card {
        background: #fff; border-radius: 16px;
        padding: 22px 24px; margin-bottom: 16px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 1px 4px rgba(0,0,0,0.04);
      }
      .card-title {
        font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em;
        text-transform: uppercase; color: #9ca3af; margin: 0 0 14px;
      }

      .order-row {
        display: flex; justify-content: space-between; align-items: baseline;
        padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 0.9rem;
      }
      .order-row:last-child { border-bottom: none; }
      .order-row-label { color: #6b7280; }
      .order-row-value { font-weight: 500; color: #111; text-align: right; }

      .order-total {
        display: flex; justify-content: space-between;
        padding-top: 14px; margin-top: 4px;
        border-top: 2px solid #111;
        font-weight: 700; font-size: 1.05rem;
      }

      .product-item {
        display: flex; justify-content: space-between;
        align-items: baseline; padding: 8px 0;
        border-bottom: 1px solid #f3f4f6; font-size: 0.88rem;
      }
      .product-item:last-child { border-bottom: none; }
      .product-name { color: #374151; flex: 1; padding-right: 12px; }
      .product-qty  { color: #9ca3af; font-size: 0.8rem; }
      .product-price { font-weight: 500; color: #111; white-space: nowrap; }

      /* Transfer card */
      .transfer-card {
        background: #fffbeb; border: 1.5px solid #fcd34d;
        border-radius: 16px; padding: 22px 24px; margin-bottom: 16px;
      }
      .transfer-title {
        font-weight: 700; color: #92400e; font-size: 1rem; margin: 0 0 8px;
      }
      .transfer-sub {
        font-size: 0.88rem; color: #a16207; margin: 0 0 14px; line-height: 1.5;
      }
      .transfer-data {
        background: #fef9c3; border-radius: 10px;
        padding: 12px 14px; font-size: 0.83rem;
        color: #78350f; line-height: 1.9; margin-bottom: 14px;
      }
      .transfer-data strong { display: block; margin-bottom: 2px; }

      /* Buttons */
      .btn {
        display: flex; align-items: center; justify-content: center; gap: 8px;
        width: 100%; padding: 13px 20px; border: none; cursor: pointer;
        border-radius: 12px; font-size: 0.93rem; font-weight: 600;
        transition: transform 0.15s, box-shadow 0.15s;
        font-family: 'DM Sans', sans-serif;
      }
      .btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      .btn:active { transform: translateY(0); }
      .btn-green   { background: #16a34a; color: #fff; }
      .btn-blue    { background: #2563eb; color: #fff; }
      .btn-outline { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }

      .btn-group { display: flex; flex-direction: column; gap: 10px; }

      /* Feedback */
      .feedback-card {
        background: #eff6ff; border: 1.5px solid #bfdbfe;
        border-radius: 16px; padding: 18px 24px; margin-bottom: 16px;
        text-align: center;
      }
      .feedback-card p { font-size: 0.88rem; color: #1e40af; margin: 0 0 12px; }

      /* Error */
      .error-card {
        background: #fef2f2; border: 1px solid #fecaca;
        border-radius: 12px; padding: 14px 18px; margin-bottom: 16px;
        font-size: 0.85rem; color: #b91c1c;
      }

      /* Confetti */
      .confetti-wrap {
        position: fixed; inset: 0; pointer-events: none; overflow: hidden;
      }
      .confetti-piece {
        position: absolute; border-radius: 2px;
        animation: confettiFall linear forwards;
      }
      @keyframes confettiFall {
        0%   { transform: translateY(-10vh) rotate(0deg);   opacity: 1; }
        100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
      }

      /* Keyframes */
      @keyframes pop {
        0%   { transform: scale(0.4); opacity: 0; }
        100% { transform: scale(1);   opacity: 1; }
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes pulse-dot {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.3; }
      }
      .live-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: #16a34a; display: inline-block;
        animation: pulse-dot 1.4s ease infinite;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Trigger splash exit after status resolves (or after timeout for LOADING)
  useEffect(() => {
    if (status === PaymentStatus.LOADING && !pedidoData) return; // wait for first data
    // Small delay so the user sees the splash color
    const timer = setTimeout(() => {
      setSplashExiting(true);
      setTimeout(() => setSplashVisible(false), 700);
    }, 1800);
    return () => clearTimeout(timer);
  }, [status, pedidoData]);

  const refreshPedidoStatus = async () => {
    if (!externalId || isRefreshing) return;
    try {
      setIsRefreshing(true);
      const data: PedidoData = await apiFetch(`/pedido/${externalId}`);
      setPedidoData(data);
      console.log("Pedido refreshed:", data);
      if (data.estado === "APROBADO") setStatus(PaymentStatus.SUCCESS);
      else if (data.estado === "RECHAZADO" || data.estado === "CANCELADO") setStatus(PaymentStatus.FAIL);
      else setStatus(PaymentStatus.LOADING);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al verificar");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchPedido = async () => {
      if (!externalId) {
        setError("No encontramos el ID de tu pedido en la URL.");
        setStatus(PaymentStatus.FAIL);
        setSplashExiting(true);
        setTimeout(() => setSplashVisible(false), 700);
        return;
      }
      try {
        const data: PedidoData = await apiFetch(`/pedido/${externalId}`);
        setPedidoData(data);
        if (data.estado === "APROBADO") setStatus(PaymentStatus.SUCCESS);
        else if (data.estado === "RECHAZADO" || data.estado === "CANCELADO") setStatus(PaymentStatus.FAIL);
        else setStatus(PaymentStatus.LOADING);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        setStatus(PaymentStatus.FAIL);
      }
    };
    fetchPedido();
  }, [externalId]);

  useEffect(() => {
    let interval: number;
    if (pedidoData?.estado === "PENDIENTE") {
      interval = setInterval(async () => {
        try {
          const data: PedidoData = await apiFetch(`/pedido/${externalId}`);
          setPedidoData(data);
          if (data.estado === "APROBADO") setStatus(PaymentStatus.SUCCESS);
          else if (data.estado === "RECHAZADO" || data.estado === "CANCELADO") setStatus(PaymentStatus.FAIL);
        } catch {/* silent */}
      }, 5000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [pedidoData, externalId]);

  // ─── Splash ───────────────────────────────────────────────────────────────
  const splashClass =
    status === PaymentStatus.SUCCESS ? "splash-success" :
    status === PaymentStatus.FAIL    ? "splash-fail" :
    "splash-loading";

  const splashIcon =
    status === PaymentStatus.SUCCESS ? (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ) : status === PaymentStatus.FAIL ? (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ) : (
      <div className="splash-spinner" />
    );

  const splashTitle =
    status === PaymentStatus.SUCCESS ? "¡Listo, pedido confirmado!" :
    status === PaymentStatus.FAIL    ? "Algo salió mal" :
    "Verificando tu pago…";

  const splashSub =
    status === PaymentStatus.SUCCESS ? "Tu compra fue procesada correctamente" :
    status === PaymentStatus.FAIL    ? "No se pudo procesar el pago" :
    "Solo un momento, por favor";

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const fmt = (n: number | string) =>
    `$${Number(n).toLocaleString("es-AR")}`;

  const deliveryLabel =
    pedidoData?.delivery_method === "pickup" ? "Retiro en tienda" :
    pedidoData?.delivery_method === "shipping" ? "Envío a domicilio" : null;

  const openWhatsApp = () => {
    const msg = `Hola, adjunto comprobante de transferencia para el pedido #${pedidoData?.id}`;
    window.open(`https://wa.me/5492615987988?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // ─── Transfer block ───────────────────────────────────────────────────────
  const TransferBlock = () => (
    <div className="transfer-card">
      <p className="transfer-title">📱 Envianos el comprobante</p>
      <p className="transfer-sub">
        Para confirmar tu pedido, transferí el importe y mandanos el comprobante por WhatsApp.
      </p>
      <div className="transfer-data">
        Alias: <strong>WE.TECH</strong>
        CBU: 0150516001000141430202<br />
        <strong>Datos de cuenta ICBC</strong>
        Titular: FEDERICO ERNESTO POLIZZI<br />
      </div>
      <button className="btn btn-green" onClick={openWhatsApp}>
        <span>💬</span> Enviar comprobante por WhatsApp
      </button>
    </div>
  );

  // ─── Main content ─────────────────────────────────────────────────────────
  const renderContent = () => {
    if (status === PaymentStatus.LOADING) {
      return (
        <>
          <span className="status-badge badge-loading">
            <span className="live-dot" /> Verificando
          </span>
          <h1 className="page-title">Verificando tu pago</h1>
          <p className="page-sub">
            {pedidoData
              ? "Tu pedido está pendiente de confirmación. Revisamos el estado cada pocos segundos."
              : "Estamos buscando tu pedido…"}
          </p>

          {pedidoData && (
            <div className="card">
              <p className="card-title">Tu pedido</p>
              <div className="order-row">
                <span className="order-row-label">Número</span>
                <span className="order-row-value">{pedidoData.comprobante_numero}</span>
              </div>
              <div className="order-row">
                <span className="order-row-label">Cliente</span>
                <span className="order-row-value">{pedidoData.cliente_nombre}</span>
              </div>
              <div className="order-total">
                <span>Total</span>
                <span>{fmt(pedidoData.total)}</span>
              </div>
            </div>
          )}

          {isTransferPending && <TransferBlock />}

          <div className="btn-group">
            <button
              className="btn btn-blue"
              onClick={refreshPedidoStatus}
              disabled={isRefreshing}
            >
              <RefreshCw style={{ width: 16, height: 16, ...(isRefreshing ? { animation: "spin 0.9s linear infinite" } : {}) }} />
              {isRefreshing ? "Verificando…" : "Revisar ahora"}
            </button>
          </div>
        </>
      );
    }

    if (status === PaymentStatus.SUCCESS) {
      return (
        <>
          {/* Confetti */}
          <div className="confetti-wrap">
            {[...Array(22)].map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${5 + Math.random() * 10}%`,
                  width: `${6 + Math.random() * 8}px`,
                  height: `${10 + Math.random() * 14}px`,
                  background: ["#fde047","#22c55e","#3b82f6","#ec4899","#f97316"][Math.floor(Math.random()*5)],
                  animationDuration: `${3 + Math.random() * 3}s`,
                  animationDelay: `${Math.random() * 1.5}s`,
                }}
              />
            ))}
          </div>

          <span className="status-badge badge-success">✓ Pago confirmado</span>
          <h1 className="page-title">¡Gracias, {pedidoData?.cliente_nombre?.split(" ")[0]}!</h1>
          <p className="page-sub">Tu pedido está en camino. Pronto vas a recibir novedades.</p>

          {/* Order summary */}
          <div className="card">
            <p className="card-title">Resumen del pedido #{pedidoData?.id}</p>

            {pedidoData?.productos?.map(p => (
              <div key={p.id} className="product-item">
                <div>
                  <span className="product-name">{p.descripcion}</span>
                  <span className="product-qty"> × {p.cantidad}</span>
                </div>
                <span className="product-price">{fmt(p.precio_unitario * p.cantidad)}</span>
              </div>
            ))}

            {pedidoData?.costo_envio && parseFloat(pedidoData.costo_envio) > 0 && (
              <div className="order-row" style={{ marginTop: 10 }}>
                <span className="order-row-label">Envío</span>
                <span className="order-row-value">{fmt(pedidoData.costo_envio)}</span>
              </div>
            )}
            {pedidoData?.codigo_cupon && (
              <div className="order-row">
                <span className="order-row-label">Cupón {pedidoData.codigo_cupon}</span>
                <span className="order-row-value" style={{ color: "#16a34a" }}>
                  {pedidoData.descuento_cupon ? `−${fmt(pedidoData.descuento_cupon)}` : "aplicado"}
                </span>
              </div>
            )}
            <div className="order-total">
              <span>Total</span>
              <span>{fmt(pedidoData?.total ?? 0)}</span>
            </div>
            {deliveryLabel && (
              <p style={{ fontSize: "0.82rem", color: "#6b7280", marginTop: 10, marginBottom: 0 }}>
                🚚 {deliveryLabel}
              </p>
            )}
          </div>

          {/* Feedback */}
          <div className="feedback-card">
            <p>¿Cómo fue tu experiencia de compra? Tu opinión nos ayuda mucho 💙</p>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSfQsKpid_G41javou3KaZcoULz0VXpRJQKtGnhdBk8P92CJIQ/viewform?usp=publish-editor"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-blue"
              style={{ textDecoration: "none", display: "inline-flex" }}
            >
              Contarnos tu experiencia
            </a>
          </div>

          <div className="btn-group">
            <button className="btn btn-outline" onClick={() => (window.location.href = "/")}>
              Volver al inicio
            </button>
          </div>
        </>
      );
    }

    // FAIL
    return (
      <>
        <span className="status-badge badge-fail">✕ Pago no procesado</span>
        <h1 className="page-title">
          {pedidoData ? "No pudimos procesar el pago" : "Algo no salió bien"}
        </h1>
        <p className="page-sub">
          {pedidoData
            ? "No te preocupes, podés intentarlo de nuevo o contactarnos para ayudarte."
            : "No encontramos tu pedido. Revisá el link o contactanos."}
        </p>

        {error && <div className="error-card">⚠ {error}</div>}

        {pedidoData && (
          <div className="card">
            <p className="card-title">Pedido {pedidoData.comprobante_numero}</p>
            <div className="order-row">
              <span className="order-row-label">Cliente</span>
              <span className="order-row-value">{pedidoData.cliente_nombre}</span>
            </div>
            <div className="order-total">
              <span>Total</span>
              <span>{fmt(pedidoData.total)}</span>
            </div>
          </div>
        )}

        <div className="btn-group">
          <button className="btn btn-blue" onClick={refreshPedidoStatus} disabled={isRefreshing}>
            <RefreshCw style={{ width: 16, height: 16, ...(isRefreshing ? { animation: "spin 0.9s linear infinite" } : {}) }} />
            {isRefreshing ? "Verificando…" : "Volver a verificar"}
          </button>
          <button className="btn btn-outline" onClick={() => (window.location.href = "/")}>
            Ir al inicio
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="pago-root">
      {/* SPLASH de pantalla completa */}
      {splashVisible && (
        <div className={`splash ${splashClass} ${splashExiting ? "exiting" : ""}`}>
          <div className="splash-icon">{splashIcon}</div>
          <p className="splash-text">{splashTitle}</p>
          <p className="splash-sub">{splashSub}</p>
        </div>
      )}

      {/* Contenido principal */}
      {!splashVisible && (
        <div className="content-wrap">
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default PaymentCallback;