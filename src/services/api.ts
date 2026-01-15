// src/services/api.ts

const API_BASE_URL = import.meta.env.VITE_API_URL;
const BEARER_TOKEN = import.meta.env.VITE_API_BEARER_TOKEN; 

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${BEARER_TOKEN}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchClienteByCuit(cuit: string) {
  try {
    const data = await apiFetch(`/vta-cliente/${cuit}`);

    if (!data) return null;
    return {
      nombre: data.razonSocial || data.nombre || "",
      email: data.email || "",
      telefono: data.telefono || "",
      calle: data.domicilio?.calle || "",
      numero: data.domicilio?.numero || "",
      ciudad: data.localidad || "",
      codigo_postal: data.domicilio?.codigo_postal || "",
      observaciones: data.observaciones || "",
    };
  } catch (error) {
    console.error(`No se encontró cliente con CUIT ${cuit}:`, error);
    return null;
  }
}

export async function verifyCoupon(couponCode: string) {
  try {
    const data = await apiFetch(`/cupones/${couponCode}`);
    if (!data) return null;
    return {
      id: data.id,
      descripcion: data.descripcion,
      porcentajeDescuento: parseFloat(data.porcentajeDescuento),
      activo: data.activo,
      fechaDesde: new Date(data.fechaDesde),
      fechaHasta: new Date(data.fechaHasta),
    };
  } catch (error) {
    console.error(`Cupón inválido: ${couponCode}:`, error);
    return null;
  }
}

export async function useCoupon(cuponId: string, cuit: string, pedidoId: string) {
  try {
    const data = await apiFetch(`/cupones/usar`, {
      method: "POST",
      body: JSON.stringify({
        cupon_id: cuponId,
        cuit,
        pedido_id: pedidoId,
      }),
    });
    return data;
  } catch (error) {
    console.error(`Error al usar el cupón:`, error);
    return null;
  }
}
