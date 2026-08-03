import { TariffConfig } from "../types";

const DEFAULT_TARIFF_CONFIG: TariffConfig = {
  // Precios de potencia (€/kW/día)
  precioPotenciaDiaP1: 0.086861,
  precioPotenciaDiaP2: 0.012946,

  // Tarifa fija (€/kWh)
  precioEnergiaP1: 0.193066,
  precioEnergiaP2: 0.193066,
  precioEnergiaP3: 0.193066,

  // Tarifa variable (€/kWh)
  precioEnergiaP1Var: 0.259332,
  precioEnergiaP2Var: 0.190165,
  precioEnergiaP3Var: 0.157301,

  // Costes regulados
  costeBonoSocialDia: 0.02468985, // 9,011295 €/año
  alquilerContadorDia: 0.02663,

  // Impuestos
  impuestoElectrico: 0.051127, // 5.1127%
  iva: 0.21, // 21%
};

export const LOGOS_ENERGIA_CONFIG: TariffConfig = { ...DEFAULT_TARIFF_CONFIG };

const TARIFF_CONFIG_KEYS: (keyof TariffConfig)[] = [
  "precioPotenciaDiaP1",
  "precioPotenciaDiaP2",
  "precioEnergiaP1",
  "precioEnergiaP2",
  "precioEnergiaP3",
  "precioEnergiaP1Var",
  "precioEnergiaP2Var",
  "precioEnergiaP3Var",
  "costeBonoSocialDia",
  "alquilerContadorDia",
  "impuestoElectrico",
  "iva",
];

function isTariffConfig(value: unknown): value is TariffConfig {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return TARIFF_CONFIG_KEYS.every((key) => typeof candidate[key] === "number");
}

export async function loadTariffConfig(): Promise<TariffConfig> {
  try {
    const response = await fetch("/tariff-config.json", {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return { ...DEFAULT_TARIFF_CONFIG };
    }

    const payload = await response.json();
    if (!isTariffConfig(payload)) {
      return { ...DEFAULT_TARIFF_CONFIG };
    }

    return {
      ...DEFAULT_TARIFF_CONFIG,
      ...payload,
    };
  } catch {
    return { ...DEFAULT_TARIFF_CONFIG };
  }
}

export const LOGOS_CONTRACT_URL = {
  clasica: "https://logosenergia.es/contratar?tarifa=clasica",
  variable: "https://logosenergia.es/contratar?tarifa=variable",
};
