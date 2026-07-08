import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { BillResults } from "../types";

interface BillChartProps {
  results: BillResults;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-2.5 rounded-lg shadow-xl font-sans text-xs max-w-[200px]">
        <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">{data.name}</p>
        <p className="font-mono font-bold text-cyan-600 dark:text-cyan-400 mt-1">
          {data.value.toFixed(2)} €
        </p>
      </div>
    );
  }
  return null;
};

export default function BillChart({ results }: BillChartProps) {
  const data = [
    { name: "Término Fijo (Potencia)", value: results.totalFijo, color: "#059669" },
    { name: "Peajes y Cargos Acceso", value: results.totalPeajes, color: "#3b82f6" },
    { name: "Coste de la Energía", value: results.totalEnergia, color: "#06b6d4" },
    { name: "Impuesto Eléctrico", value: results.totalIee, color: "#f59e0b" },
    { name: "Regulados (Contador/Bono)", value: results.totalRegulados, color: "#6366f1" },
    { name: "Telecomunicaciones (Internet)", value: results.totalInternet, color: "#ec4899" },
    { name: "IVA", value: results.totalIva, color: "#f43f5e" },
  ].filter((item) => item.value > 0);

  const total = results.totalFactura;

  return (
    <div id="chart-container" className="h-[280px] w-full flex flex-col items-center justify-center">
      {total > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="35%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              iconType="circle"
              iconSize={10}
              formatter={(value, entry: any) => {
                const percentage = total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : "0";
                return (
                  <span className="text-2xs text-slate-600 dark:text-slate-300 font-sans font-semibold">
                    {value} ({percentage}%)
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-gray-500 font-sans">Introduce datos para generar el gráfico</p>
      )}
    </div>
  );
}
