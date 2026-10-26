export const COMPLEMENT_CATEGORY = 'COMPLEMENTOS PARA IMPRESION 3D';

type ComplementInput = {
  id: string;
  grupo?: string | null;
  idPadre?: string | null;
};

export const isComplement = (item: ComplementInput): boolean =>
  item.grupo?.trim().toUpperCase() === COMPLEMENT_CATEGORY;

// El padre de los vasos agrupa capacidades diferentes; cada SKU cuenta por separado.
const COMPLEMENT_TIERS: Record<string, number> = {
  'VASO ALUM 500ML': 21.29,
  'VASO ALUM 600ML': 22.72,
  'VASO ALUM 1L': 19.6,
  'INS-MATE-GENE': 27.2,
  'INS-TAZA-GENE': 25.64,
  'INS-VASO-MILK-GENE': 32.01,
};

const COMPLEMENT_PRESENTATIONS: Record<string, string> = {
  'INS-MATE-BLAN': 'INS-MATE-GENE',
  'INS-MATE-NEGR': 'INS-MATE-GENE',
  'INS-TAZA-NEGR': 'INS-TAZA-GENE',
  'INS-VASO-MILK': 'INS-VASO-MILK-GENE',
};

export const getComplementPresentation = (
  item: ComplementInput,
): string | null => {
  if (!isComplement(item)) return null;
  if (COMPLEMENT_TIERS[item.id]) return item.id;
  return (
    COMPLEMENT_PRESENTATIONS[item.id] ??
    (item.idPadre && COMPLEMENT_TIERS[item.idPadre] ? item.idPadre : item.id)
  );
};

export const getComplementDiscountPercentage = (
  item: ComplementInput,
  quantity: number,
): number => {
  const presentation = getComplementPresentation(item);
  return presentation
    ? quantity >= 10
      ? (COMPLEMENT_TIERS[presentation] ?? 15)
      : 15
    : 0;
};

export const getComplementQuantityTier = (
  item: ComplementInput,
): { quantity: number; percentage: number } | null => {
  const presentation = getComplementPresentation(item);
  const percentage = presentation ? COMPLEMENT_TIERS[presentation] : undefined;

  return percentage === undefined ? null : { quantity: 10, percentage };
};

export const getMateComboComponent = (
  item: ComplementInput,
): 'mate' | 'bombilla' | null => {
  if (!isComplement(item)) return null;
  if (item.id === 'INS-MATE-BLAN' || item.id === 'INS-MATE-NEGR') return 'mate';
  return item.id === 'INS-BOMB-NEGR' ? 'bombilla' : null;
};

export const getMateComboQuantities = (
  items: Array<ComplementInput & { quantity: number }>,
): { mates: number; bombillas: number; pairs: number } => {
  let mates = 0;
  let bombillas = 0;

  for (const item of items) {
    const component = getMateComboComponent(item);
    if (component === 'mate') mates += item.quantity;
    if (component === 'bombilla') bombillas += item.quantity;
  }

  return { mates, bombillas, pairs: Math.min(mates, bombillas) };
};

