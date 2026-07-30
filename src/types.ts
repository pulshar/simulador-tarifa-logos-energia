export interface TariffConfig {
  precioPotenciaDiaP1: number;
  precioPotenciaDiaP2: number;
  precioEnergiaP1: number;
  precioEnergiaP2: number;
  precioEnergiaP3: number;
  precioEnergiaP1Var: number;
  precioEnergiaP2Var: number;
  precioEnergiaP3Var: number;
  costeBonoSocialDia: number;
  alquilerContadorDia: number;
  impuestoElectrico: number;
  iva: number;
}

export interface UserInputs {
  potenciaP1: number | string;
  potenciaP2: number | string;
  consumoP1: number | string;
  consumoP2: number | string;
  consumoP3: number | string;
  dias: number | string;
  importeActual?: number | string;
}

export interface CalculationResultDetail {
  potencia: number;
  energia: number;
  bonoSocial: number;
  alquiler: number;
  otros: number;
  IEE: number;
  IVA: number;
  impuestos: number;
  total: number;
}

export interface CalculationResult {
  clasica: CalculationResultDetail;
  variable: CalculationResultDetail;
}
