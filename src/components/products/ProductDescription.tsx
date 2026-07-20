import {
  AlertTriangle,
  BadgeInfo,
  Bolt,
  Box,
  Camera,
  Circle,
  GitMerge,
  GraduationCap,
  Lightbulb,
  Monitor,
  Palette,
  Printer,
  Star,
  Sun,
  Thermometer,
  Wifi,
} from "lucide-react";
import { Product } from "../../types";
import {
  getProductDescriptionKind,
  getSectionTitlesForKind,
  parseGamaOrigen,
  parseSections,
  ProductDescriptionKind,
} from "../../utils/productDescription";

type IconComponent = typeof Thermometer;

const LEVEL_BARS: Record<string, number> = {
  PRINCIPIANTE: 1,
  INTERMEDIO: 2,
  AVANZADO: 3,
};

const FILAMENT_ICONS: Record<string, IconComponent> = {
  TEMPERATURAS: Thermometer,
  "UNA VEZ IMPRESO": Sun,
  "PARA QUE SIRVE": Lightbulb,
  "POR QUE ELEGIRLO": Star,
};

const SPEC_ICONS: { token: string; icon: IconComponent }[] = [
  { token: "volumen", icon: Box },
  { token: "extrusor", icon: GitMerge },
  { token: "boquilla", icon: Thermometer },
  { token: "cama", icon: Thermometer },
  { token: "velocidad", icon: Bolt },
  { token: "pantalla", icon: Monitor },
  { token: "conectividad", icon: Wifi },
  { token: "camara", icon: Camera },
  { token: "multicolor", icon: Palette },
];

const readableTitle = (title: string) =>
  title.charAt(0) + title.slice(1).toLowerCase();

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

const hasAnySection = (sections: Record<string, string>) =>
  Object.values(sections).some((value) => value.trim().length > 0);

function TextBlock({ text, className = "" }: { text: string; className?: string }) {
  return (
    <p className={`whitespace-pre-line text-sm leading-6 ${className}`}>
      {text}
    </p>
  );
}

function GamaBadge({ gama }: { gama: string | null }) {
  if (!gama) return null;

  const normalized = normalize(gama);
  if (normalized === "PREMIUM") {
    return (
      <span className="rounded-md bg-black px-2.5 py-1 text-xs font-semibold text-yellow-300">
        Premium
      </span>
    );
  }

  if (normalized === "INTERMEDIO") {
    return (
      <span className="rounded-md bg-zinc-600 px-2.5 py-1 text-xs font-semibold text-white">
        Intermedio
      </span>
    );
  }

  return (
    <span className="rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
      Basico
    </span>
  );
}

function OriginBadge({ origen }: { origen: string | null }) {
  if (!origen) return null;

  return (
    <span className="rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
      {normalize(origen) === "NACIONAL" ? "Industria nacional" : "Importado"}
    </span>
  );
}

function LevelBadge({ level }: { level?: string }) {
  if (!level) return null;

  const activeBars = LEVEL_BARS[normalize(level)] ?? 0;
  const heights = [6, 9, 12, 15, 18];

  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
      <div className="flex items-end gap-0.5" aria-hidden>
        {heights.map((height, index) => (
          <span
            key={height}
            className={`w-1 rounded-sm ${index < activeBars ? "bg-yellow-400" : "bg-gray-300"}`}
            style={{ height }}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-gray-900">{level}</span>
    </div>
  );
}

function PrinterBadge({ text }: { text?: string }) {
  if (!text) return null;

  const restrictive = !text.trim().startsWith("Cualquier impresora");

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 ${
        restrictive ? "bg-black text-yellow-300" : "bg-gray-100 text-gray-900"
      }`}
    >
      <span className="relative inline-flex">
        <Printer className="h-4 w-4" />
        {restrictive && (
          <span className="absolute -bottom-1 -right-2 rounded bg-yellow-300 px-1 text-[8px] font-bold leading-none text-black">
            3D
          </span>
        )}
      </span>
      <span className="text-xs font-semibold">{text}</span>
    </div>
  );
}

function WarningBand({ text }: { text?: string }) {
  if (!text) return null;

  return (
    <div className="rounded-r-lg border border-red-200 border-l-4 border-l-red-500 bg-gray-50 p-3">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
        <div>
          <p className="text-xs font-semibold text-red-700">Advertencia</p>
          <TextBlock text={text} className="mt-1 text-gray-600" />
        </div>
      </div>
    </div>
  );
}

function HighlightWeTech({ text }: { text?: string }) {
  if (!text) return null;

  return (
    <div className="rounded-lg bg-yellow-300 p-3 text-amber-950">
      <div className="mb-1 flex items-center gap-2">
        <GraduationCap className="h-4 w-4" />
        <p className="text-xs font-semibold">Ventaja WeTECH</p>
      </div>
      <TextBlock text={text} className="text-amber-950" />
    </div>
  );
}

function SectionWithIcon({ title, text }: { title: string; text?: string }) {
  if (!text) return null;

  const Icon = FILAMENT_ICONS[title] ?? Circle;

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-yellow-300 text-black">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{readableTitle(title)}</p>
        <TextBlock text={text} className="mt-1 text-gray-600" />
      </div>
    </div>
  );
}

function EaseOfUse({ text }: { text?: string }) {
  if (!text) return null;

  const [letterLine, ...details] = text.split(/\r?\n/);
  const selected = letterLine.trim().toUpperCase();
  const letters = ["A", "B", "C", "D", "E"];

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-gray-500">Facilidad de uso</p>
      <div className="flex h-10 gap-1">
        {letters.map((letter) => (
          <div
            key={letter}
            className={`flex items-center justify-center border text-sm font-semibold ${
              selected === letter
                ? "flex-[1.8] border-black bg-black text-yellow-300"
                : "flex-1 border-gray-200 bg-gray-100 text-gray-500"
            }`}
          >
            {letter}
          </div>
        ))}
      </div>
      {details.length > 0 && (
        <TextBlock text={details.join(" ").trim()} className="mt-2 text-xs text-gray-500" />
      )}
    </div>
  );
}

const specIconFor = (label: string) => {
  const normalizedLabel = label.toLowerCase();
  return SPEC_ICONS.find(({ token }) => normalizedLabel.includes(token))?.icon ?? Circle;
};

function Specifications({ text }: { text?: string }) {
  if (!text) return null;

  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) {
        return { label: line, value: "" };
      }

      return {
        label: line.slice(0, separatorIndex).trim(),
        value: line.slice(separatorIndex + 1).trim(),
      };
    });

  if (rows.length === 0) return null;

  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-gray-500">
        Especificaciones tecnicas
      </p>
      <div className="divide-y divide-gray-200 text-sm">
        {rows.map(({ label, value }) => {
          const Icon = specIconFor(label);
          return (
            <div key={`${label}-${value}`} className="grid grid-cols-[1fr_auto] gap-3 py-2">
              <span className="flex items-center gap-2 text-gray-600">
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </span>
              {value && <span className="text-right font-medium text-gray-900">{value}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StartupBadge({ text }: { text?: string }) {
  if (!text) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600">
      <BadgeInfo className="h-4 w-4" />
      <span>Puesta en marcha: {text}</span>
    </div>
  );
}

function PlainProductText({
  title,
  text,
}: {
  title: string;
  text?: string;
}) {
  if (!text) return null;

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500">{readableTitle(title)}</p>
      <TextBlock text={text} className="mt-1 text-gray-900" />
    </div>
  );
}

function FilamentDescription({
  sections,
  gama,
  origen,
}: {
  sections: Record<string, string>;
  gama: string | null;
  origen: string | null;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        <GamaBadge gama={gama} />
        <OriginBadge origen={origen} />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <LevelBadge level={sections.NIVEL} />
        <PrinterBadge text={sections.IMPRESORA} />
      </div>

      <div className="space-y-4">
        {["TEMPERATURAS", "UNA VEZ IMPRESO", "PARA QUE SIRVE", "POR QUE ELEGIRLO"].map(
          (title) => (
            <SectionWithIcon key={title} title={title} text={sections[title]} />
          ),
        )}
        <WarningBand text={sections.ADVERTENCIA} />
      </div>
    </div>
  );
}

function PrinterDescription({
  product,
  sections,
  kind,
  gama,
}: {
  product: Product;
  sections: Record<string, string>;
  kind: ProductDescriptionKind;
  gama: string | null;
}) {
  const descriptionParts = product.description.split("|").map((part) => part.trim());
  const displayName =
    descriptionParts.length >= 2
      ? `${descriptionParts[0]} ${descriptionParts[1]}`
      : product.name;

  const textSections = [
    "MATERIALES COMPATIBLES",
    "COMPATIBLE CON",
    "PARA QUE SIRVE",
    "POR QUE ELEGIRLA",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative inline-flex flex-shrink-0">
            <Printer className="h-6 w-6 text-black" />
            <span className="absolute -bottom-1 -right-2 rounded bg-yellow-300 px-1 text-[8px] font-bold leading-none text-amber-950">
              3D
            </span>
          </span>
          <span className="min-w-0 truncate text-base font-semibold text-gray-900">
            {displayName}
          </span>
        </div>
        <GamaBadge gama={gama} />
      </div>

      <HighlightWeTech text={sections["VENTAJA WETECH"]} />
      {kind !== "accessory" && <EaseOfUse text={sections["FACILIDAD DE USO"]} />}
      <Specifications text={sections.ESPECIFICACIONES} />

      <div className="space-y-3">
        {textSections.map((title) => (
          <PlainProductText key={title} title={title} text={sections[title]} />
        ))}
      </div>

      <WarningBand text={sections.ADVERTENCIA} />
      <StartupBadge text={sections["PUESTA EN MARCHA"]} />
    </div>
  );
}

export function ProductDescription({ product }: { product: Product }) {
  const kind = getProductDescriptionKind(product);
  const sections = parseSections(
    product.observaciones ?? "",
    getSectionTitlesForKind(kind),
  );
  const { gama, origen } = parseGamaOrigen(product.description);

  if (!hasAnySection(sections)) {
    return product.observaciones ? (
      <TextBlock text={product.observaciones} className="text-gray-600" />
    ) : null;
  }

  return (
    <div className="mt-5">
      {kind === "filament" ? (
        <FilamentDescription sections={sections} gama={gama} origen={origen} />
      ) : (
        <PrinterDescription
          product={product}
          sections={sections}
          kind={kind}
          gama={gama}
        />
      )}
    </div>
  );
}
