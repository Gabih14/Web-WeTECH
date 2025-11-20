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
