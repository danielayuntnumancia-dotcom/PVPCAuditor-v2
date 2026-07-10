import { useState, useEffect } from "react";
import {
  Zap,
  Calendar,
  DollarSign,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Sun,
  Moon,
  TrendingDown,
  Download,
  BrainCircuit,
  Bot,
  Sliders,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle
} from "lucide-react";
import { BillData } from "./types";
import { DEFAULT_PVPC_VALUES, DEMO_PROFILES, calcularFactura, formatDate } from "./utils";
import BillChart from "./components/BillChart";
import BillOptimizer from "./components/BillOptimizer";
import Scanner from "./components/Scanner";
import ChatBot from "./components/ChatBot";

export default function App() {
  const [billData, setBillData] = useState<BillData>(() => {
    const saved = localStorage.getItem("pvpc_bill_data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_PVPC_VALUES;
      }
    }
    return DEFAULT_PVPC_VALUES;
  });

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [scanExplanation, setScanExplanation] = useState<string | null>(() => {
    return localStorage.getItem("pvpc_scan_explanation") || null;
  });

  const [activeTab, setActiveTab] = useState<"advisor" | "sandbox">("advisor");
  const [showAdvancedPotencia, setShowAdvancedPotencia] = useState<boolean>(false);
  const [showAdvancedConsumo, setShowAdvancedConsumo] = useState<boolean>(false);

  // --- Caching state updates ---
  useEffect(() => {
    localStorage.setItem("pvpc_bill_data", JSON.stringify(billData));
  }, [billData]);

  useEffect(() => {
    if (scanExplanation) {
      localStorage.setItem("pvpc_scan_explanation", scanExplanation);
    } else {
      localStorage.removeItem("pvpc_scan_explanation");
    }
  }, [scanExplanation]);

  // --- Theme loader ---
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", nextTheme);
  };

  // --- Calculations ---
  const results = calcularFactura(billData);

  // --- Form handlers ---
  const handleInputChange = (field: keyof BillData, value: string | number) => {
    setBillData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyProfile = (profileData: BillData) => {
    setBillData(profileData);
    setScanExplanation(null);
  };

  const resetToOfficial = () => {
    if (window.confirm("¿Seguro que quieres restablecer los precios a los oficiales del PVPC 2.0TD?")) {
      setBillData(DEFAULT_PVPC_VALUES);
      setScanExplanation(null);
    }
  };

  const handleScanSuccess = (scannedData: Partial<BillData>, explanation: string) => {
    setBillData((prev) => ({
      ...prev,
      ...scannedData
    }));
    setScanExplanation(explanation);
  };

  const handleApplyOptimization = (optimizedData: Partial<BillData>) => {
    setBillData((prev) => ({
      ...prev,
      ...optimizedData
    }));
  };

  const downloadJSONReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      datosFactura: billData,
      desgloseCalculado: results
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auditoria-pvpc-${billData.fechaInicio}-al-${billData.fechaFin}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 py-6 px-4 md:px-8 font-sans transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title Bar */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white">
                <Zap size={22} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-display text-slate-900 dark:text-white">
                PVPC<span className="text-emerald-500 dark:text-emerald-400">AUDITOR</span>
              </h1>
            </div>
            <div className="hidden md:block h-8 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md font-sans leading-relaxed">
              Auditoría y simulación avanzada de la tarifa eléctrica regulada 2.0TD con Inteligencia Artificial Gemini
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Tarifa Activa: PVPC 2.0TD
            </div>
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 shadow-3xs transition-all shrink-0"
              title="Cambiar tema"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={resetToOfficial}
              className="px-4 py-2 bg-white hover:bg-slate-150 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-3xs transition-colors"
            >
              <RefreshCw size={14} /> Valores Oficiales
            </button>
          </div>
        </header>



        {/* Gemini Scanner result report if active */}
        {scanExplanation && (
          <div className="bg-linear-to-r from-emerald-50/70 to-cyan-50/50 dark:from-emerald-950/10 dark:to-cyan-950/5 border border-emerald-250 dark:border-emerald-900/60 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="p-2.5 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-xl text-white shrink-0 shadow-lg shadow-emerald-500/10">
              <Bot size={20} />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-950 dark:text-slate-100 flex items-center gap-1.5">
                  <Sparkles size={15} className="text-emerald-500" /> Análisis IA de Factura Escaneada
                </h3>
                <button
                  onClick={() => setScanExplanation(null)}
                  className="text-3xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold uppercase tracking-wider"
                >
                  Ocultar informe
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                {scanExplanation}
              </p>
            </div>
          </div>
        )}

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Controls & Form (lg:span-5) */}
          <section className="lg:col-span-5 space-y-6">
            
            {/* 1. IA Scanner */}
            <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-3xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 font-display flex items-center gap-2">
                  <Sparkles size={18} className="text-emerald-500" /> Escáner de Facturas por IA
                </h2>
                <span className="text-3xs font-semibold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Gemini 3.1 Pro
                </span>
              </div>
              <Scanner onScanSuccess={handleScanSuccess} />
            </div>

            {/* 2. Formular Manual Parameters */}
            <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-3xs space-y-6">
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 font-display flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-emerald-500" /> Parámetros del Suministro
              </h2>

              {/* SECTION A: Period & budget */}
              <div className="space-y-4">
                <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                  1. Periodo y Control de Presupuesto
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar size={11} /> F. Inicio
                    </label>
                    <input
                      type="date"
                      value={billData.fechaInicio}
                      onChange={(e) => handleInputChange("fechaInicio", e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-white dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar size={11} /> F. Fin
                    </label>
                    <input
                      type="date"
                      value={billData.fechaFin}
                      onChange={(e) => handleInputChange("fechaFin", e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-white dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <DollarSign size={11} /> Presupuesto Máx (€)
                    </label>
                    <input
                      type="number"
                      value={billData.presupuesto}
                      onChange={(e) => handleInputChange("presupuesto", parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-white dark:text-white"
                      placeholder="Ej: 100"
                    />
                  </div>
                  <div className="bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 dark:border-emerald-500/15 p-2.5 rounded-xl text-center">
                    <p className="text-3xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Días del periodo</p>
                    <p className="text-xl font-bold text-emerald-500 dark:text-emerald-400 font-display mt-0.5">{results.dias}</p>
                  </div>
                </div>
              </div>

              {/* SECTION B: Potencia */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                  <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    2. Potencia Contratada (Términos Fijos)
                  </h3>
                  <button
                    onClick={() => setShowAdvancedPotencia(!showAdvancedPotencia)}
                    className="text-3xs text-emerald-500 hover:text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-0.5"
                  >
                    {showAdvancedPotencia ? "Precios por defecto" : "Precios avanzados"}
                    {showAdvancedPotencia ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500 dark:text-slate-400">Punta (kW)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={billData.kwPunta}
                      onChange={(e) => handleInputChange("kwPunta", parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-white dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500 dark:text-slate-400">Valle (kW)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={billData.kwValle}
                      onChange={(e) => handleInputChange("kwValle", parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-white dark:text-white"
                    />
                  </div>
                </div>

                {showAdvancedPotencia && (
                  <div className="bg-slate-100/40 dark:bg-slate-950/60 p-4 rounded-xl space-y-3 border border-slate-200/50 dark:border-slate-850/80 animate-fadeIn text-xs">
                    <p className="font-bold text-3xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">Precios de Potencia (€/kW/año)</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-3xs text-slate-500 dark:text-slate-400 block mb-1">Peaje Punta</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={billData.precioKwPunta}
                          onChange={(e) => handleInputChange("precioKwPunta", parseFloat(e.target.value) || 0)}
                          className="w-full text-2xs p-2 bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-800 rounded-lg text-white dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-3xs text-slate-500 dark:text-slate-400 block mb-1">Peaje Valle</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={billData.precioKwValle}
                          onChange={(e) => handleInputChange("precioKwValle", parseFloat(e.target.value) || 0)}
                          className="w-full text-2xs p-2 bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-800 rounded-lg text-white dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-3xs text-slate-500 dark:text-slate-400 block mb-1">Margen</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={billData.precioMargen}
                          onChange={(e) => handleInputChange("precioMargen", parseFloat(e.target.value) || 0)}
                          className="w-full text-2xs p-2 bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-800 rounded-lg text-white dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION C: Consumo */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                  <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    3. Energía Consumida (Variables PVPC)
                  </h3>
                  <button
                    onClick={() => setShowAdvancedConsumo(!showAdvancedConsumo)}
                    className="text-3xs text-emerald-500 hover:text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-0.5"
                  >
                    {showAdvancedConsumo ? "Precios por defecto" : "Precios avanzados"}
                    {showAdvancedConsumo ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500 dark:text-slate-400 block">Punta (kWh)</label>
                    <input
                      type="number"
                      value={billData.kwhPunta}
                      onChange={(e) => handleInputChange("kwhPunta", parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-white dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500 dark:text-slate-400 block">Llano (kWh)</label>
                    <input
                      type="number"
                      value={billData.kwhLlano}
                      onChange={(e) => handleInputChange("kwhLlano", parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-white dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500 dark:text-slate-400 block">Valle (kWh)</label>
                    <input
                      type="number"
                      value={billData.kwhValle}
                      onChange={(e) => handleInputChange("kwhValle", parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-white dark:text-white"
                    />
                  </div>
                </div>

                {/* Porcentajes de Consumo por Tramo */}
                {(() => {
                  const totalKwh = billData.kwhPunta + billData.kwhLlano + billData.kwhValle;
                  const pctPunta = totalKwh > 0 ? (billData.kwhPunta / totalKwh) * 100 : 0;
                  const pctLlano = totalKwh > 0 ? (billData.kwhLlano / totalKwh) * 100 : 0;
                  const pctValle = totalKwh > 0 ? (billData.kwhValle / totalKwh) * 100 : 0;

                  return (
                    <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl p-3.5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-2xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          Distribución de Energía Consumida
                        </span>
                        <span className="font-mono text-2xs font-bold text-slate-700 dark:text-slate-200">
                          Total: {totalKwh.toFixed(1)} kWh
                        </span>
                      </div>

                      {/* Stacked Progress Bar */}
                      <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                        {pctPunta > 0 && (
                          <div
                            className="bg-rose-500 h-full transition-all duration-500"
                            style={{ width: `${pctPunta}%` }}
                            title={`Punta: ${pctPunta.toFixed(1)}%`}
                          />
                        )}
                        {pctLlano > 0 && (
                          <div
                            className="bg-amber-500 h-full transition-all duration-500"
                            style={{ width: `${pctLlano}%` }}
                            title={`Llano: ${pctLlano.toFixed(1)}%`}
                          />
                        )}
                        {pctValle > 0 && (
                          <div
                            className="bg-emerald-500 h-full transition-all duration-500"
                            style={{ width: `${pctValle}%` }}
                            title={`Valle: ${pctValle.toFixed(1)}%`}
                          />
                        )}
                      </div>

                      {/* Labels and individual percentages */}
                      <div className="grid grid-cols-3 gap-2 text-3xs font-medium pt-0.5">
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                            <span className="text-slate-600 dark:text-slate-300 font-bold">Punta (P1)</span>
                          </div>
                          <span className="font-mono text-slate-800 dark:text-slate-200 font-bold pl-3.5">
                            {pctPunta.toFixed(1)}% <span className="font-normal text-slate-500 text-[9px]">({billData.kwhPunta.toFixed(1)} kWh)</span>
                          </span>
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            <span className="text-slate-600 dark:text-slate-300 font-bold">Llano (P2)</span>
                          </div>
                          <span className="font-mono text-slate-800 dark:text-slate-200 font-bold pl-3.5">
                            {pctLlano.toFixed(1)}% <span className="font-normal text-slate-500 text-[9px]">({billData.kwhLlano.toFixed(1)} kWh)</span>
                          </span>
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-slate-600 dark:text-slate-300 font-bold">Valle (P3)</span>
                          </div>
                          <span className="font-mono text-slate-800 dark:text-slate-200 font-bold pl-3.5">
                            {pctValle.toFixed(1)}% <span className="font-normal text-slate-500 text-[9px]">({billData.kwhValle.toFixed(1)} kWh)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {showAdvancedConsumo && (
                  <div className="bg-slate-100/40 dark:bg-slate-950/60 p-4 rounded-xl space-y-4 border border-slate-200/50 dark:border-slate-850/80 animate-fadeIn text-xs">
                    <div>
                      <p className="font-bold text-3xs text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Coste Energía Variable Diario (€/kWh)</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-3xs text-slate-500 dark:text-slate-400 block mb-1">C. Var. Punta</label>
                          <input
                            type="number"
                            step="0.000001"
                            value={billData.costeEnergiaPunta ?? billData.costeEnergiaVariable}
                            onChange={(e) => handleInputChange("costeEnergiaPunta", parseFloat(e.target.value) || 0)}
                            className="w-full text-2xs p-2 bg-slate-800 dark:bg-slate-905 border border-slate-700 dark:border-slate-800 rounded-lg text-white dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-3xs text-slate-500 dark:text-slate-400 block mb-1">C. Var. Llano</label>
                          <input
                            type="number"
                            step="0.000001"
                            value={billData.costeEnergiaLlano ?? billData.costeEnergiaVariable}
                            onChange={(e) => handleInputChange("costeEnergiaLlano", parseFloat(e.target.value) || 0)}
                            className="w-full text-2xs p-2 bg-slate-800 dark:bg-slate-905 border border-slate-700 dark:border-slate-800 rounded-lg text-white dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-3xs text-slate-500 dark:text-slate-400 block mb-1">C. Var. Valle</label>
                          <input
                            type="number"
                            step="0.000001"
                            value={billData.costeEnergiaValle ?? billData.costeEnergiaVariable}
                            onChange={(e) => handleInputChange("costeEnergiaValle", parseFloat(e.target.value) || 0)}
                            className="w-full text-2xs p-2 bg-slate-800 dark:bg-slate-905 border border-slate-700 dark:border-slate-800 rounded-lg text-white dark:text-white"
                          />
                        </div>
                      </div>
                      <p className="text-3xs text-slate-500 dark:text-slate-400 mt-1.5 leading-tight">Cargos reales de la energía para cada periodo. Promedio OMIE de referencia.</p>
                    </div>

                    <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-3">
                      <p className="font-bold text-3xs text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Peajes de Acceso Energía (€/kWh)</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-3xs text-slate-500 dark:text-slate-400 block mb-1">Peaje Punta</label>
                          <input
                            type="number"
                            step="0.000001"
                            value={billData.precioKwhPunta}
                            onChange={(e) => handleInputChange("precioKwhPunta", parseFloat(e.target.value) || 0)}
                            className="w-full text-2xs p-2 bg-slate-800 dark:bg-slate-905 border border-slate-700 dark:border-slate-800 rounded-lg text-white dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-3xs text-slate-500 dark:text-slate-400 block mb-1">Peaje Llano</label>
                          <input
                            type="number"
                            step="0.000001"
                            value={billData.precioKwhLlano}
                            onChange={(e) => handleInputChange("precioKwhLlano", parseFloat(e.target.value) || 0)}
                            className="w-full text-2xs p-2 bg-slate-800 dark:bg-slate-905 border border-slate-700 dark:border-slate-800 rounded-lg text-white dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-3xs text-slate-500 dark:text-slate-400 block mb-1">Peaje Valle</label>
                          <input
                            type="number"
                            step="0.000001"
                            value={billData.precioKwhValle}
                            onChange={(e) => handleInputChange("precioKwhValle", parseFloat(e.target.value) || 0)}
                            className="w-full text-2xs p-2 bg-slate-800 dark:bg-slate-905 border border-slate-700 dark:border-slate-800 rounded-lg text-white dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION D: Regulados y Telecom */}
              <div className="space-y-4">
                <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                  4. Conceptos Regulados y Telecom
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-2xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Contador (€/día)</label>
                    <input
                      type="number"
                      step="0.00001"
                      value={billData.alqContador}
                      onChange={(e) => handleInputChange("alqContador", parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl text-white dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-2xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Bono Social (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={billData.bonoSocial}
                      onChange={(e) => handleInputChange("bonoSocial", parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl text-white dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-2xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Cuota Internet (€)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={billData.cuotaInternet}
                      onChange={(e) => handleInputChange("cuotaInternet", parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl text-white dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION E: Taxes */}
              <div className="space-y-4">
                <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                  5. Impuestos Aplicables
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500 dark:text-slate-400 block">Impuesto Eléctrico (IEE %)</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={billData.iee}
                      onChange={(e) => handleInputChange("iee", parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl text-white dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500 dark:text-slate-400 block">IVA (%)</label>
                    <select
                      value={billData.iva}
                      onChange={(e) => handleInputChange("iva", parseInt(e.target.value) || 21)}
                      className="w-full text-xs p-2.5 bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-white dark:text-white"
                    >
                      <option value="21">21% (Estándar)</option>
                      <option value="10">10% (Reducido)</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* RIGHT COLUMN: Visual Invoice & AI Sandbox Tabs (lg:span-7) */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* Real-looking Spanish Bill Replica & Chart */}
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-3xs flex flex-col">
              
              {/* Teal/Emerald Header bar */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-950 dark:to-teal-950 p-5 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold font-display tracking-tight uppercase">
                      Detalle de Factura Regulada (Réplica)
                    </h2>
                    <p className="text-2xs text-emerald-100 dark:text-emerald-200 opacity-90 mt-0.5 font-sans">
                      Periodo: {formatDate(billData.fechaInicio)} al {formatDate(billData.fechaFin)} ({results.dias} días)
                    </p>
                  </div>
                  <div className="bg-white/10 px-3 py-1.5 rounded-lg text-right shrink-0 border border-white/5">
                    <span className="text-3xs uppercase font-extrabold tracking-wider block opacity-75">Comercializadora</span>
                    <span className="text-xs font-bold font-mono">PVPC 2.0TD</span>
                  </div>
                </div>
              </div>

              {/* Replica invoice contents */}
              <div className="p-6 space-y-5 flex-1">
                <div className="space-y-2 text-xs font-sans">
                  
                  {/* Fijo */}
                  <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-slate-800 dark:text-slate-200 font-bold">Término Fijo (Prorrateo de Potencia)</span>
                      <span className="font-mono text-slate-950 dark:text-slate-100 font-bold">{results.totalFijo.toFixed(2)} €</span>
                    </div>
                    {/* Sub-tramos detailed breakdown */}
                    <div className="pl-4 space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      <div className="flex justify-between">
                        <span>• Potencia Punta: <span className="font-semibold text-slate-700 dark:text-slate-300">{billData.kwPunta} kW</span> × {billData.precioKwPunta.toFixed(6)} €/kW/año × {results.dias} d / 365</span>
                        <span className="font-mono font-medium">{((billData.kwPunta * billData.precioKwPunta * results.dias) / 365).toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Potencia Valle: <span className="font-semibold text-slate-700 dark:text-slate-300">{billData.kwValle} kW</span> × {billData.precioKwValle.toFixed(6)} €/kW/año × {results.dias} d / 365</span>
                        <span className="font-mono font-medium">{((billData.kwValle * billData.precioKwValle * results.dias) / 365).toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Margen Comercial: <span className="font-semibold text-slate-700 dark:text-slate-300">{billData.kwPunta} kW</span> × {billData.precioMargen.toFixed(6)} €/kW/año × {results.dias} d / 365</span>
                        <span className="font-mono font-medium">{((billData.kwPunta * billData.precioMargen * results.dias) / 365).toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>

                  {/* Peajes y Cargos */}
                  <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-slate-800 dark:text-slate-200 font-bold">Peajes y Cargos de Acceso (Término de Energía)</span>
                      <span className="font-mono text-slate-950 dark:text-slate-100 font-bold">{results.totalPeajes.toFixed(2)} €</span>
                    </div>
                    {/* Sub-tramos peajes breakdown */}
                    <div className="pl-4 space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      <div className="flex justify-between">
                        <span>• Peaje Punta: <span className="font-semibold text-slate-700 dark:text-slate-300">{billData.kwhPunta} kWh</span> × {billData.precioKwhPunta.toFixed(6)} €/kWh</span>
                        <span className="font-mono font-medium">{(billData.kwhPunta * billData.precioKwhPunta).toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Peaje Llano: <span className="font-semibold text-slate-700 dark:text-slate-300">{billData.kwhLlano} kWh</span> × {billData.precioKwhLlano.toFixed(6)} €/kWh</span>
                        <span className="font-mono font-medium">{(billData.kwhLlano * billData.precioKwhLlano).toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Peaje Valle: <span className="font-semibold text-slate-700 dark:text-slate-300">{billData.kwhValle} kWh</span> × {billData.precioKwhValle.toFixed(6)} €/kWh</span>
                        <span className="font-mono font-medium">{(billData.kwhValle * billData.precioKwhValle).toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>

                  {/* Coste de la Energía */}
                  <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-slate-800 dark:text-slate-200 font-bold">Coste del Consumo de Energía (Término de Consumo)</span>
                      <span className="font-mono text-slate-950 dark:text-slate-100 font-bold">{results.totalEnergia.toFixed(2)} €</span>
                    </div>
                    {/* Sub-tramos energia breakdown */}
                    <div className="pl-4 space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      <div className="flex justify-between">
                        <span>• Consumo Punta: <span className="font-semibold text-slate-700 dark:text-slate-300">{billData.kwhPunta.toFixed(2)} kWh</span> × {(billData.costeEnergiaPunta ?? billData.costeEnergiaVariable).toFixed(6)} €/kWh</span>
                        <span className="font-mono font-medium">{(billData.kwhPunta * (billData.costeEnergiaPunta ?? billData.costeEnergiaVariable)).toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Consumo Llano: <span className="font-semibold text-slate-700 dark:text-slate-300">{billData.kwhLlano.toFixed(2)} kWh</span> × {(billData.costeEnergiaLlano ?? billData.costeEnergiaVariable).toFixed(6)} €/kWh</span>
                        <span className="font-mono font-medium">{(billData.kwhLlano * (billData.costeEnergiaLlano ?? billData.costeEnergiaVariable)).toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Consumo Valle: <span className="font-semibold text-slate-700 dark:text-slate-300">{billData.kwhValle.toFixed(2)} kWh</span> × {(billData.costeEnergiaValle ?? billData.costeEnergiaVariable).toFixed(6)} €/kWh</span>
                        <span className="font-mono font-medium">{(billData.kwhValle * (billData.costeEnergiaValle ?? billData.costeEnergiaVariable)).toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>

                  {/* Impuesto electrico */}
                  <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-slate-850 dark:text-slate-200 font-bold">Impuesto sobre Electricidad (IEE {billData.iee.toFixed(2)}%)</span>
                      <span className="font-mono text-slate-950 dark:text-slate-100 font-bold">{results.totalIee.toFixed(2)} €</span>
                    </div>
                    <div className="pl-4 space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      <div className="flex justify-between">
                        <span>• Calculado sobre (Potencia + Energía): <span className="font-semibold text-slate-700 dark:text-slate-300">{(results.totalFijo + results.totalVariable).toFixed(2)} €</span> × {billData.iee.toFixed(4)}%</span>
                        <span className="font-mono font-medium">{results.totalIee.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>

                  {/* Regulados */}
                  <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-slate-800 dark:text-slate-200 font-bold">Conceptos Regulados (Alquiler y Bono Social)</span>
                      <span className="font-mono text-slate-950 dark:text-slate-100 font-bold">{results.totalRegulados.toFixed(2)} €</span>
                    </div>
                    {/* Sub-tramos regulados breakdown */}
                    <div className="pl-4 space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      <div className="flex justify-between">
                        <span>• Alquiler de Equipo de Medida (Contador): <span className="font-semibold text-slate-700 dark:text-slate-300">{results.dias} días</span> × {billData.alqContador.toFixed(6)} €/día</span>
                        <span className="font-mono font-medium">{(billData.alqContador * results.dias).toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Financiación del Bono Social: <span className="font-semibold text-slate-700 dark:text-slate-300">Cuota fija periodo</span></span>
                        <span className="font-mono font-medium">{billData.bonoSocial.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>

                  {/* Internet */}
                  {results.totalInternet > 0 && (
                    <div className="flex justify-between items-baseline border-b border-slate-100 dark:border-slate-800/60 pb-2">
                      <span className="text-slate-500 dark:text-slate-400">Telecomunicaciones (Cuota Internet mensual)</span>
                      <span className="font-mono text-slate-950 dark:text-slate-100 font-bold">{results.totalInternet.toFixed(2)} €</span>
                    </div>
                  )}

                  {/* IVA */}
                  <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-slate-850 dark:text-slate-200 font-bold">IVA Aplicado ({billData.iva}%)</span>
                      <span className="font-mono text-slate-950 dark:text-slate-100 font-bold">{results.totalIva.toFixed(2)} €</span>
                    </div>
                    <div className="pl-4 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      <div className="flex justify-between">
                        <span>• Calculado sobre Base Imponible: <span className="font-semibold text-slate-700 dark:text-slate-300">{(results.totalFijo + results.totalVariable + results.totalIee + results.totalRegulados + results.totalInternet).toFixed(2)} €</span> × {billData.iva}%</span>
                        <span className="font-mono font-medium">{results.totalIva.toFixed(2)} €</span>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500/90 leading-relaxed font-sans bg-slate-50 dark:bg-slate-900/30 p-2 rounded-lg border border-slate-100 dark:border-slate-800/40">
                        Base = Potencia ({(results.totalFijo).toFixed(2)} €) + Consumo ({(results.totalVariable).toFixed(2)} €) + IEE ({results.totalIee.toFixed(2)} €) + Regulados ({results.totalRegulados.toFixed(2)} €) {results.totalInternet > 0 ? `+ Internet (${results.totalInternet.toFixed(2)} €)` : ''}
                      </div>
                    </div>
                  </div>

                  {/* TOTAL FACTURA */}
                  <div className="flex justify-between items-center pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-800 mt-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans tracking-wide">IMPORTE TOTAL FACTURA</span>
                    <div className="text-right">
                      <span className="text-3xl font-black font-display text-emerald-500 dark:text-emerald-400">
                        {results.totalFactura.toFixed(2)} €
                      </span>
                    </div>
                  </div>

                </div>

                {/* Warnings Box if above budget */}
                {results.alertaPresupuesto && (
                  <div className="bg-rose-50 dark:bg-rose-950/15 border border-rose-200 dark:border-rose-900/40 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="font-bold text-xs text-rose-950 dark:text-rose-100">
                        🚨 Límite de presupuesto superado
                      </p>
                      <p className="text-2xs text-rose-700 dark:text-rose-350 leading-relaxed font-sans">
                        Tu factura simulada de {results.totalFactura.toFixed(2)} € excede tu límite presupuestario de {billData.presupuesto} €. ¡Usa el simulador de abajo o habla con el asesor para encontrar opciones de ahorro!
                      </p>
                    </div>
                  </div>
                )}

                {/* Visual Pie Chart */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-2">
                  <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">
                    Estructura Porcentual del Coste
                  </h3>
                  <BillChart results={results} />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={downloadJSONReport}
                    className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-950/40 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download size={13} /> Exportar Informe Auditoría (.json)
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Tabs Sandbox Panel (Advisor & Optimizer tabs) */}
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-3xs">
              
              {/* Tab Navigation header */}
              <div className="flex border-b border-slate-150 dark:border-slate-800/60">
                <button
                  onClick={() => setActiveTab("advisor")}
                  className={`flex-1 py-4 text-center font-bold text-sm transition-all border-b-2 flex items-center justify-center gap-2 ${
                    activeTab === "advisor"
                      ? "border-emerald-500 text-emerald-500 dark:border-emerald-400 dark:text-emerald-400 bg-emerald-500/5"
                      : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <Bot size={16} /> Asesor IA Luz inteligente
                </button>
                <button
                  onClick={() => setActiveTab("sandbox")}
                  className={`flex-1 py-4 text-center font-bold text-sm transition-all border-b-2 flex items-center justify-center gap-2 ${
                    activeTab === "sandbox"
                      ? "border-emerald-500 text-emerald-500 dark:border-emerald-400 dark:text-emerald-400 bg-emerald-500/5"
                      : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <Sliders size={16} /> Simulador y Sandbox de Ahorro
                </button>
              </div>

              {/* Tab Content body */}
              <div className="p-5">
                {activeTab === "advisor" ? (
                  <ChatBot billData={billData} results={results} />
                ) : (
                  <BillOptimizer
                    data={billData}
                    results={results}
                    onApplyOptimization={handleApplyOptimization}
                  />
                )}
              </div>

            </div>

          </section>
          
        </div>

      </div>
    </div>
  );
}
