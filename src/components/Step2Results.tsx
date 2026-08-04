import confetti from "@hiseb/confetti";
import { CheckCircle, MoveRight, TrendingDown } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { LOGOS_CONTRACT_URL } from "../lib/config";
import { CalculationResult } from "../types";
import { AnimatedNumber } from "./AnimatedNumber";

interface Props {
  key?: string;
  result: CalculationResult;
  importeActual?: number | string;
  onReset: () => void;
}

export function Step2Results({ result, importeActual, onReset }: Props) {
  const [activeTab, setActiveTab] = useState<"clasica" | "variable">("clasica");

  const currentResult = result[activeTab];
  const parseNum = (val: string | number | undefined) => {
    if (val === undefined || val === "") return 0;
    return Number(String(val).replace(",", ".")) || 0;
  };
  const importeActualNum = parseNum(importeActual);
  const ahorro = importeActualNum
    ? importeActualNum - currentResult.total
    : null;
  const isAhorro = ahorro !== null && ahorro > 0;

  const handleTotalAnimationComplete = () => {
    if (!isAhorro) return;

    confetti({
      count: 120,
      position: { x: window.innerWidth / 2, y: 30 },
      size: 1.4,
      velocity: 180,
      color: ["#F43F5E", "#8B5CF6", "#06B6D4", "#FBBF24"],
      fade: false,
    });
  };

  const Row = ({
    label,
    value,
    delay = 0,
  }: {
    label: string;
    value: number;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex justify-between items-center py-3.5 border-b border-ink/10 last:border-0"
    >
      <span className="text-ink-soft font-sans">{label}</span>
      <span className="font-mono font-medium text-ink">
        <AnimatedNumber value={value} suffix=" €" />
      </span>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="card-premium p-6 md:p-10 -mt-8 md:mt-0 mb-8 relative overflow-hidden">
        <h2 className="text-2xl md:text-3xl font-serif text-ink mb-6 text-center">
          Tu estimación con <em>Logos Energía.</em>
        </h2>

        {/* Tabs */}
        <div className="tabs-container-premium mb-8">
          <button
            onClick={() => setActiveTab("clasica")}
            className={`tab-btn-premium ${activeTab === "clasica" ? "active" : ""}`}
          >
            Tarifa Clásica
          </button>
          <button
            onClick={() => setActiveTab("variable")}
            className={`tab-btn-premium ${activeTab === "variable" ? "active" : ""}`}
          >
            Tarifa Variable
          </button>
        </div>

        <div className="flex flex-col gap-1 mb-8">
          <Row
            label="Término de potencia"
            value={currentResult.potencia}
            delay={0.1}
          />
          <Row
            label="Término de energía"
            value={currentResult.energia}
            delay={0.2}
          />
          <Row
            label="Otros conceptos"
            value={currentResult.otros}
            delay={0.3}
          />
          <Row label="Impuestos" value={currentResult.impuestos} delay={0.4} />
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-bg-warm-alt/50 border border-ink/5 rounded-2xl p-6 text-center"
        >
          <p className="text-ink-soft text-xs mb-1 uppercase tracking-[0.12em] font-mono font-medium">
            Total estimado
          </p>
          <div className="text-5xl md:text-6xl font-serif text-brand tracking-tight py-2">
            <AnimatedNumber
              value={currentResult.total}
              suffix=" €"
              onComplete={handleTotalAnimationComplete}
            />
          </div>
          {isAhorro && (
            <div className="mt-4 inline-flex items-center gap-1.5 bg-accent-soft text-brand-ink px-3 py-1.5 rounded-full text-xs font-mono font-medium tracking-tight shadow-sm">
              <TrendingDown className="w-4 h-4 text-brand" />
              <span>
                Ahorrarías <AnimatedNumber value={ahorro} suffix=" €" />{" "}
                respecto a tu factura actual
              </span>
            </div>
          )}
          {!importeActualNum && (
            <div className="mt-4 text-ink-soft text-xs font-mono font-medium tracking-tight">
              Con Logos Energía pagarías aproximadamente{" "}
              <AnimatedNumber value={currentResult.total} suffix=" €" />
            </div>
          )}
        </motion.div>

        {/* Trust Badges */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-ink-soft font-sans">
          {[
            "Sin permanencia",
            "Energía 100% renovable",
            "Atención personalizada",
            "Sin costes ocultos",
          ].map((text, i) => (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              key={text}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-brand shrink-0" />
              <span className="font-medium">{text}</span>
            </motion.div>
          ))}
        </div>
        <p className="text-[11px] text-ink-mute text-center mt-10 leading-relaxed font-sans">
          Estimación realizada según los precios vigentes de Logos Energía. Los
          precios utilizados para el cálculo de la energía en la tarifa variable
          se basa en la cotización de OMIP del próximo año móvil. Estos precios
          pueden fluctuar en función del mercado.
        </p>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="text-center space-y-6"
      >
        <h2 className="text-2xl font-serif text-ink">Empieza a ahorrar hoy</h2>
        <div className="flex flex-col gap-3">
          <a
            href={LOGOS_CONTRACT_URL[activeTab]}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full btn-logos py-4 text-lg"
          >
            <span>
              Contratar tarifa{" "}
              {activeTab === "clasica" ? "clásica" : "variable"}
            </span>
            <span className="btn-logos__arrow">
              <MoveRight className="w-5 h-5 mt-0.5 shrink-0" />
            </span>
          </a>
          <button
            onClick={onReset}
            className="w-full btn-logos btn-logos--ghost py-3"
          >
            Volver al simulador
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
