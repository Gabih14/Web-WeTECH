// Familias de productos que no deben mostrarse en la tienda
export const excludedFamilies = {
  // Ejemplos de familias a excluir (puedes agregar o quitar según necesites)
  families: [
    "3N3 PETG 750gr",
    "3N3PLA",
    "3N3 TPU 500GR",
    "3NMAX PLA+",
    "3NMAX SE 750GR",
    "PLA ENDER 1KG",
    "FILAMENTO LAPIZ",
    "FREMOVER PLA NAC",
    "Fremover Silk",
    "Fremover Dual",
    "Fremover Tricolor",
    "FREMOV PETG CARFIB",
    "FREMOV PETG GLASSFIB",
    "FREMOVER PLA IMP",
    "FREMOVER PLA WOOD",
    "FREMOVER GLOW",
    "GRILON3 ABS",
    "GRILON3 ACETAL",
    "GRILON3 SIMPLIFLEX",
    "GRILON3 HIPS",
    "PLA KIT",
    "GRILON3 MAXI ABS",
    "GRILON3MAXIFILL PETG",
    "GRILON3MAXIFILPLA850",
    "GRILON3 MEGAFILL PLA",
    "GRILON3MEGA BOUTIQUE",
    "GRILON3MEGAFILL PETG",
    "GRILON3 NYLON 12",
    "GRILON3 NYLON 6",
    "GRILON3 PETG",
    "GRILON3 PLA 1KG",
    "GRILON3 PLA ASTRA",
    "GRILON3 PLA SILK",
    "GRILON3 PLA WOOD",
    "GRILON3 PLA 850",
    "GRILON3 PLA 870",
    "GRILON3 PLA BOUTIQUE",
    "GRILON3 PPT",
    "GRILON3 PVA 5OOGR",
    "GRILON3 PLA ZETA",
    "GST3D PETG",
    "GST DUAL",
    "GST3D PLA+",
    "GST3D PLA+ GLOW",
    "GST3D PLA+ SILK",
    "GST3D Tricolor",
    "PLA HELLBOT ECO 1KG",
    "HELLBOT PLA RAINBOW",
    "PLA HELLBOT REC 1KG",
    "PLA HELLREC LOCK 1KG",
    "ABS PRINT A LOT 1KG",
    "PETG PRINT A LOT 1KG",
    "PLA PRINT A LOT 1KG",
  ],

  // También puedes excluir por patrones (opcional)
  patterns: [
    /^TEST_/i, // Excluye familias que empiecen con "TEST_"
    /DEMO$/i, // Excluye familias que terminen con "DEMO"
  ],
};

// Función helper para verificar si una familia debe ser excluida
export const shouldExcludeFamily = (familia: string): boolean => {
  if (!familia) return false;

  // Verificar si está en la lista de familias excluidas
  if (excludedFamilies.families.includes(familia)) {
    return true;
  }

  // Verificar si coincide con algún patrón
  return excludedFamilies.patterns.some((pattern) => pattern.test(familia));
};
