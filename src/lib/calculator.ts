import { CalculationResult, CalculationResultDetail, TariffConfig, UserInputs } from '../types';

export function calcularFactura(inputs: UserInputs, config: TariffConfig): CalculationResult {
  const parseNum = (val: string | number) => Number(String(val).replace(',', '.')) || 0;
  
  const p1 = parseNum(inputs.potenciaP1);
  const p2 = parseNum(inputs.potenciaP2);
  const c1 = parseNum(inputs.consumoP1);
  const c2 = parseNum(inputs.consumoP2);
  const c3 = parseNum(inputs.consumoP3);
  const d = parseNum(inputs.dias);

  const potencia = p1 * d * config.precioPotenciaDiaP1 + p2 * d * config.precioPotenciaDiaP2;
  const bonoSocial = d * config.costeBonoSocialDia;
  const alquiler = d * config.alquilerContadorDia;
  const otros = bonoSocial + alquiler;

  const calcDetail = (e1: number, e2: number, e3: number): CalculationResultDetail => {
    const energia = c1 * e1 + c2 * e2 + c3 * e3;
    const IEE = (potencia + energia + bonoSocial) * config.impuestoElectrico;
    const IVA = (potencia + energia + bonoSocial + IEE + alquiler) * config.iva;
    
    return {
      potencia,
      energia,
      bonoSocial,
      alquiler,
      otros,
      IEE,
      IVA,
      impuestos: IEE + IVA,
      total: potencia + energia + bonoSocial + alquiler + IEE + IVA,
    };
  };

  return {
    clasica: calcDetail(config.precioEnergiaP1, config.precioEnergiaP2, config.precioEnergiaP3),
    variable: calcDetail(config.precioEnergiaP1Var, config.precioEnergiaP2Var, config.precioEnergiaP3Var)
  };
}
