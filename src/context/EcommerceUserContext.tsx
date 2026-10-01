import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/react";
import { authenticatedApiFetch } from "../services/api";
import {
  hasWholesaleAccess,
  type EcommerceUser,
  type WholesaleStatus,
} from "../types/ecommerceUser";
import { getEcommerceAuthAction } from "../utils/ecommerceAuthState";

interface EcommerceUserContextValue {
  user: EcommerceUser | null;
  wholesaleStatus: WholesaleStatus | null;
  isWholesale: boolean;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  setWholesaleStatus: (status: WholesaleStatus) => void;
}

const EcommerceUserContext = createContext<EcommerceUserContextValue | null>(
  null
);

export function EcommerceUserProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const [user, setUser] = useState<EcommerceUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const refresh = useCallback(() => {
    setRefreshVersion((version) => version + 1);
  }, []);

  const setWholesaleStatus = useCallback((status: WholesaleStatus) => {
    setUser((current) =>
      current
        ? { ...current, customer: { ...current.customer, wholesaleStatus: status } }
        : current
    );
  }, []);

  useEffect(() => {
    const authAction = getEcommerceAuthAction(isLoaded, isSignedIn);

    if (authAction === "WAIT") {
      setIsLoading(true);
      return;
    }

    if (authAction === "CLEAR") {
      setUser(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    authenticatedApiFetch<EcommerceUser>("/auth/me", getToken, {
      signal: controller.signal,
    })
      .then((response) => {
        setUser(response);
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          requestError instanceof Error
            ? requestError
            : new Error("No se pudo consultar el usuario")
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [getToken, isLoaded, isSignedIn, refreshVersion, userId]);

  const wholesaleStatus = user?.customer.wholesaleStatus ?? null;
  const value = useMemo<EcommerceUserContextValue>(
    () => ({
      user,
      wholesaleStatus,
      isWholesale: hasWholesaleAccess(wholesaleStatus),
      isLoading,
      error,
      refresh,
      setWholesaleStatus,
    }),
    [error, isLoading, refresh, setWholesaleStatus, user, wholesaleStatus]
  );

  return (
    <EcommerceUserContext.Provider value={value}>
      {children}
    </EcommerceUserContext.Provider>
  );
}

// El provider y su hook forman una única API de contexto.
// eslint-disable-next-line react-refresh/only-export-components
export function useEcommerceUser(): EcommerceUserContextValue {
  const context = useContext(EcommerceUserContext);

  if (!context) {
    throw new Error(
      "useEcommerceUser debe usarse dentro de EcommerceUserProvider"
    );
  }

  return context;
}
