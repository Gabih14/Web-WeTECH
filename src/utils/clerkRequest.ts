export class MissingAuthenticationError extends Error {
  constructor() {
    super("No hay una sesión autenticada disponible");
    this.name = "MissingAuthenticationError";
  }
}

export type SessionTokenGetter = () => Promise<string | null>;

export async function createClerkAuthorizationHeaders(
  getToken: SessionTokenGetter,
  initialHeaders?: HeadersInit
): Promise<Headers> {
  const token = await getToken();

  if (!token) {
    throw new MissingAuthenticationError();
  }

  const headers = new Headers(initialHeaders);
  headers.set("Authorization", `Bearer ${token}`);
  return headers;
}
