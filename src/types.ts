export interface BillData {
  fechaInicio: string;
  fechaFin: string;
  presupuesto: number;
  
  // Potencia
  kwPunta: number;
  kwValle: number;
  precioMargen: number; // €/kW/año
  precioKwPunta: number; // €/kW/año
  precioKwValle: number; // €/kW/año

  // Consumo energía
  kwhPunta: number;
  kwhLlano: number;
  kwhValle: number;
  
  // Precios Peajes/Cargos de consumo
  precioKwhPunta: number; // €/kWh
  precioKwhLlano: number; // €/kWh
  precioKwhValle: number; // €/kWh
  
  // Coste energía variable (coste energía diario PVPC sin peajes o combinado)
  costeEnergiaVariable: number; // €/kWh

  // Regulados y otros
  alqContador: number; // €/día
  bonoSocial: number; // € Fijo
  cuotaInternet: number; // € Fijo (para simular telecomunicaciones opcionales)

  // Impuestos
  iee: number; // %
  iva: number; // %
}

export interface BillResults {
  dias: number;
  totalFijo: number;
  totalVariable: number;
  totalPeajes: number;
  totalEnergia: number;
  totalIee: number;
  totalRegulados: number;
  totalInternet: number;
  totalIva: number;
  totalFactura: number;
  alertaPresupuesto: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ title: string; url: string }>;
  timestamp: string;
  isThinking?: boolean;
}
