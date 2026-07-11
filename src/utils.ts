import { BillData, BillResults } from "./types";

// Official default PVPC 2.0TD values (standard benchmarks in Spain)
export const DEFAULT_PVPC_VALUES: BillData = {
  fechaInicio: "2026-06-01",
  fechaFin: "2026-06-30",
  presupuesto: 100,

  // Potencias contratadas (fijos)
  kwPunta: 4.4,
  kwValle: 4.4,
  precioMargen: 3.113, // €/kW/año margen comercializador
  precioKwPunta: 27.704413, // €/kW/año peaje transporte punta
  precioKwValle: 0.725423, // €/kW/año peaje transporte valle

  // Consumos
  kwhPunta: 85.2,
  kwhLlano: 92.4,
  kwhValle: 140.8,

  // Peajes de energía activa (€/kWh)
  precioKwhPunta: 0.097553,
  precioKwhLlano: 0.003292,
  precioKwhValle: 0.029267,

  // Coste energía variable (coste diario mercado mayorista OMIE promedio aproximado)
  costeEnergiaVariable: 0.169183,
  costeEnergiaPunta: 0.169183,
  costeEnergiaLlano: 0.169183,
  costeEnergiaValle: 0.169183,

  // Regulados y otros
  alqContador: 0.026630, // €/día
  bonoSocial: 0.60, // € cargo fijo periodo
  cuotaInternet: 0.00, // € cuota mensual telecom

  // Impuestos
  iee: 5.112696, // Impuesto Eléctrico %
  iva: 21, // IVA % (por defecto 21%, a veces 10% según directiva)
};

export const DEMO_PROFILES = [
  {
    name: "Perfil Soltero (Ahorrador)",
    description: "Bajo consumo, potencia ajustada (3.3 kW) y hábitos de consumo nocturno/valle.",
    data: {
      ...DEFAULT_PVPC_VALUES,
      kwPunta: 3.3,
      kwValle: 3.3,
      kwhPunta: 40.2,
      kwhLlano: 45.1,
      kwhValle: 95.8,
      presupuesto: 60,
    }
  },
  {
    name: "Hogar Familiar (Consumo Alto)",
    description: "4 personas, potencia alta (5.5 kW) y consumo elevado de electrodomésticos en horas llano y punta.",
    data: {
      ...DEFAULT_PVPC_VALUES,
      kwPunta: 5.5,
      kwValle: 5.5,
      kwhPunta: 155.4,
      kwhLlano: 180.2,
      kwhValle: 210.5,
      presupuesto: 150,
    }
  },
  {
    name: "Piso Desoptimizado (Gasto Alto)",
    description: "Consumo concentrado en horas caras (punta) al mediodía y tarde. Gran potencial de ahorro con IA.",
    data: {
      ...DEFAULT_PVPC_VALUES,
      kwPunta: 4.6,
      kwValle: 4.6,
      kwhPunta: 190.5,
      kwhLlano: 110.2,
      kwhValle: 65.4,
      presupuesto: 110,
    }
  }
];

export function calcularFactura(data: BillData): BillResults {
  // 1. Calcular días
  const fIni = new Date(data.fechaInicio);
  const fFin = new Date(data.fechaFin);
  let dias = 0;
  if (!isNaN(fIni.getTime()) && !isNaN(fFin.getTime()) && fFin >= fIni) {
    // Math.ceil para contar el día de inicio y final correctamente
    dias = Math.ceil((fFin.getTime() - fIni.getTime()) / (1000 * 3600 * 24)) || 1;
  } else {
    dias = 1;
  }

  // 2. Término Fijo (Potencia)
  // Prorrateo anual: (kW * precioAnual * dias) / 365
  const costePuntaFijo = (data.kwPunta * data.precioKwPunta * dias) / 365;
  const costeValleFijo = (data.kwValle * data.precioKwValle * dias) / 365;
  const costeMargen = (data.kwPunta * data.precioMargen * dias) / 365;
  const totalFijo = costePuntaFijo + costeValleFijo + costeMargen;

  // 3. Término Variable (Energía + Peajes)
  const kwhTotal = data.kwhPunta + data.kwhLlano + data.kwhValle;
  const costePeajes = (data.kwhPunta * data.precioKwhPunta) +
                      (data.kwhLlano * data.precioKwhLlano) +
                      (data.kwhValle * data.precioKwhValle);
  const costeEnergia = (data.kwhPunta * (data.costeEnergiaPunta ?? data.costeEnergiaVariable)) +
                       (data.kwhLlano * (data.costeEnergiaLlano ?? data.costeEnergiaVariable)) +
                       (data.kwhValle * (data.costeEnergiaValle ?? data.costeEnergiaVariable));
  const totalVariable = costePeajes + costeEnergia;

  // 4. Impuesto Eléctrico (IEE) se aplica sobre (Fijo + Variable)
  const baseElectrica = totalFijo + totalVariable;
  const totalIee = baseElectrica * (data.iee / 100);

  // 5. Conceptos Regulados
  const totalRegulados = data.bonoSocial + (data.alqContador * dias);

  // 6. Telecomunicaciones
  const totalInternet = data.cuotaInternet;

  // 7. IVA se aplica sobre Base Imponible Completa
  const baseImponible = baseElectrica + totalIee + totalRegulados + totalInternet;
  const totalIva = baseImponible * (data.iva / 100);

  // 8. Gran Total
  const totalFactura = baseImponible + totalIva;

  // 9. Presupuesto
  const alertaPresupuesto = data.presupuesto > 0 && totalFactura > data.presupuesto;

  return {
    dias,
    totalFijo: Number(totalFijo.toFixed(4)),
    totalVariable: Number(totalVariable.toFixed(4)),
    totalPeajes: Number(costePeajes.toFixed(4)),
    totalEnergia: Number(costeEnergia.toFixed(4)),
    totalIee: Number(totalIee.toFixed(4)),
    totalRegulados: Number(totalRegulados.toFixed(4)),
    totalInternet: Number(totalInternet.toFixed(4)),
    totalIva: Number(totalIva.toFixed(4)),
    totalFactura: Number(totalFactura.toFixed(2)),
    alertaPresupuesto,
  };
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}
