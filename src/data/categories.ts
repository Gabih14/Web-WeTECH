import { Category } from "../types";

export const categories: Category[] = [
  {
    name: "Filamentos",
    id: "filamentos",
    subcategories: [
      { name: "PLA", id: "pla" },
      { name: "Técnicos", id: "tecnicos" },
    ],
  },
  {
    name: "IMPRESORAS FDM",
    id: "IMPRESORAS FDM",
    subcategories: [
      { name: "Filamento", id: "filamento" },
      { name: "Resina", id: "resina" },
    ],
  },
  {
    name: "Repuestos",
    id: "repuestos",
  },
];
