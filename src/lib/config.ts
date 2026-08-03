import { TariffConfig } from "../types";
/*
export const LOGOS_ENERGIA_CONFIG: TariffConfig = {
  // Configuración de precios actualizada (Tarifa Clásica / Valores del script)
  precioPotenciaDiaP1: 0.075903, // €/kW/día
  precioPotenciaDiaP2: 0.001987, // €/kW/día

  precioEnergiaP1: 0.222166, // €/kWh
  precioEnergiaP2: 0.146315, // €/kWh
  precioEnergiaP3: 0.126367, // €/kWh

  precioEnergiaP1Var: 0.231296, // €/kWh
  precioEnergiaP2Var: 0.153635, // €/kWh
  precioEnergiaP3Var: 0.131989, // €/kWh

  costeBonoSocialDia: 0.024688, // €/día
  alquilerContadorDia: 0.02663, // €/día

  impuestoElectrico: 0.051127, // 5.1127%
  iva: 0.21, // 21%
};

export const LOGOS_CONTRACT_URL = {
  clasica: "https://logosenergia.es/contratar?tarifa=clasica",
  variable: "https://logosenergia.es/contratar?tarifa=variable",
};
*/

export const LOGOS_ENERGIA_CONFIG: TariffConfig = {
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

export const LOGOS_CONTRACT_URL = {
  clasica: "https://logosenergia.es/contratar?tarifa=clasica",
  variable: "https://logosenergia.es/contratar?tarifa=variable",
};
