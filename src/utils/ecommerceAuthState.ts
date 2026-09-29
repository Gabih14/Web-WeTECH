export type EcommerceAuthAction = "WAIT" | "CLEAR" | "LOAD";

export function getEcommerceAuthAction(
  isLoaded: boolean,
  isSignedIn: boolean | undefined
): EcommerceAuthAction {
  if (!isLoaded) return "WAIT";
  return isSignedIn ? "LOAD" : "CLEAR";
}
