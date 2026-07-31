import { Info, Loader2, UploadCloud, Sparkles, MoveRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useRef, useState } from "react";
import { UserInputs } from "../types";

interface InputFieldProps {
  label: string;
  field: keyof UserInputs;
  tooltip: string;
  value: string | number | undefined;
  onChange: (field: keyof UserInputs, value: string | number) => void;
  required?: boolean;
  tooltipAlign?: "center" | "right";
}

function InputField({
  label,
  field,
  tooltip,
  value,
  onChange,
  required = true,
  tooltipAlign = "center",
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink-soft flex items-center gap-1.5">
        {label}
        <div className="group relative flex items-center">
          <Info className="w-4 h-4 text-ink-mute cursor-help" />
          <div
            className={`absolute bottom-full mb-2 w-48 p-2 bg-ink text-bg-warm text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 text-center shadow-lg ${tooltipAlign === "right"
              ? "right-[-10px]"
              : "left-1/2 -translate-x-1/2"
              }`}
          >
            {tooltip}
            <div
              className={`absolute top-full border-4 border-transparent border-t-ink ${tooltipAlign === "right"
                ? "right-[14px]"
                : "left-1/2 -translate-x-1/2"
                }`}
            ></div>
          </div>
        </div>
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          required={required}
          className="form-input-premium shadow-sm"
          value={value === undefined ? "" : value}
          onChange={(e) => {
            let val = e.target.value.replace(/[^0-9.,]/g, "");
            // Prevent multiple commas/dots
            const match = val.match(/[.,]/g);
            if (match && match.length > 1) {
              const firstIndex = val.search(/[.,]/);
              val =
                val.substring(0, firstIndex + 1) +
                val.substring(firstIndex + 1).replace(/[.,]/g, "");
            }
            onChange(field, val);
          }}
        />
      </div>
    </div>
  );
}

interface Props {
  key?: string;
  inputs: UserInputs;
  onChange: (field: keyof UserInputs, value: number | string) => void;
  onSubmit: () => void;
}

export function Step1Form({
  inputs,
  onChange,
  onSubmit,
  onFileParsed,
}: Props & { onFileParsed?: (data: Partial<UserInputs>) => void }) {
  const [activeTab, setActiveTab] = useState<"manual" | "upload">("manual");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingTexts = [
    "Analizando consumos...",
    "Extrayendo potencias...",
    "Calculando días facturados...",
    "Procesando importes...",
  ];

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUploading) {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
      }, 2000);
    } else {
      setLoadingTextIndex(0);
    }
    return () => clearInterval(interval);
  }, [isUploading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(",")[1];

        try {
          const res = await fetch("/.netlify/functions/extract-invoice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileBase64: base64String,
              mimeType: file.type || "application/pdf",
            }),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            const serverMessage =
              errorData?.details ||
              errorData?.error ||
              "Error al analizar la factura";
            throw new Error(serverMessage);
          }

          const data = await res.json();
          if (onFileParsed) {
            onFileParsed(data);
          }
          setActiveTab("manual");
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Error al analizar la factura";
          setUploadError(
            `${"No se pudo leer la factura. Por favor, revisa el archivo o introduce los datos manualmente."}\n${message}`,
          );
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadError("Error procesando el archivo.");
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="text-center mb-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.16em] uppercase text-ink-mute mb-3">
          <span className="eyebrow-dot" />
          Simulador de tarifas
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-ink tracking-tight text-balance mb-4">
          Descubre cuánto pagarías con <em>Logos Energía.</em>
        </h1>
        <p className="text-ink-soft text-lg leading-relaxed max-w-md">
          Introduce los datos básicos de tu consumo y obtén una estimación
          inmediata de tu ahorro.
        </p>
      </div>

      <div className="card-premium p-6 md:p-10 relative overflow-hidden">
        {/* Tabs */}
        <div className="tabs-container-premium mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`tab-btn-premium ${activeTab === "manual" ? "active" : ""}`}
          >
            Introducir a mano
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`tab-btn-premium flex items-center justify-center gap-1.5 ${activeTab === "upload" ? "active" : ""}`}
          >
            <span>Subir factura</span>
            <Sparkles className={`w-3.5 h-3.5 transition-colors ${activeTab === "upload" ? "text-brand" : "text-ink-soft"}`} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "upload" ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl transition-all cursor-pointer group ${isDragging
                ? "border-brand bg-brand-soft"
                : "border-ink/10 bg-bg-warm-alt/30 hover:bg-bg-warm-alt/60 hover:border-brand/40"
                }`}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="application/pdf,image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-4 h-[196px] justify-center pointer-events-none">
                  <Loader2 className=" text-brand w-10 h-10 animate-spin" />
                  <div className="text-ink-soft h-10 overflow-hidden relative w-full flex justify-center items-center">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={loadingTextIndex}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                        className="font-medium text-center text-sm"
                      >
                        {loadingTexts[loadingTextIndex]}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center pointer-events-none w-full">
                  <div
                    className={`w-16 h-16 bg-white rounded-full flex items-center justify-center border transition-all mb-4 ${isDragging
                      ? "border-brand/20 scale-110 text-brand"
                      : "border-ink/5 text-brand group-hover:scale-105"
                      }`}
                  >
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-medium text-ink text-center mb-2">
                    {isDragging
                      ? "Suelta tu factura aquí"
                      : "Sube tu factura en PDF o imagen"}
                  </h3>
                  <p className="text-ink-soft text-sm text-center max-w-sm min-h-15 mb-6">
                    {isDragging
                      ? "Procesaremos tu archivo al soltarlo"
                      : "Arrastra y suelta aquí, o haz clic para buscar en tu dispositivo. Extraeremos los datos."}
                  </p>
                  <button
                    type="button"
                    className={`font-medium text-sm px-4 py-2 rounded-full transition-all ${isDragging
                      ? "bg-brand text-white shadow-sm"
                      : "text-brand bg-brand-soft group-hover:bg-brand/20"
                      }`}
                  >
                    Seleccionar archivo
                  </button>
                </div>
              )}

              {uploadError && (
                <p className="text-red-500 text-sm mt-4 text-center whitespace-pre-line pointer-events-none">
                  {uploadError}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.form
              key="manual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
            >
              <div className="space-y-8">
                {/* Potencia Block */}
                <div>
                  <h3 className="text-2xl font-medium text-ink mb-4 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-soft text-brand flex items-center justify-center font-mono text-xs font-semibold">
                      1
                    </div>
                    Potencia contratada
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                      label="Potencia Punta (P1) en kW"
                      field="potenciaP1"
                      tooltip="Es la potencia más alta que tienes contratada. Habitualmente durante el día."
                      value={inputs.potenciaP1}
                      onChange={onChange}
                    />
                    <InputField
                      label="Potencia Valle (P2) en kW"
                      field="potenciaP2"
                      tooltip="Es la potencia contratada para la noche y fines de semana."
                      value={inputs.potenciaP2}
                      onChange={onChange}
                      tooltipAlign="right"
                    />
                  </div>
                </div>

                <hr />

                {/* Consumo Block */}
                <div>
                  <h3 className="text-2xl font-medium text-ink mb-4 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-soft text-brand flex items-center justify-center font-mono text-xs font-semibold">
                      2
                    </div>
                    Consumo y periodo
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <InputField
                      label="Consumo Punta (P1) en kWh"
                      field="consumoP1"
                      tooltip="Consumo realizado en las horas más caras del día."
                      value={inputs.consumoP1}
                      onChange={onChange}
                    />
                    <InputField
                      label="Consumo Llano (P2) en kWh"
                      field="consumoP2"
                      tooltip="Consumo en horas de precio intermedio."
                      value={inputs.consumoP2}
                      onChange={onChange}
                      tooltipAlign="right"
                    />
                    <InputField
                      label="Consumo Valle (P3) en kWh"
                      field="consumoP3"
                      tooltip="Consumo en las horas más baratas (noches y fines de semana)."
                      value={inputs.consumoP3}
                      onChange={onChange}
                    />
                    <InputField
                      label="Días facturados"
                      field="dias"
                      tooltip="Número de días que abarca la factura (normalmente 30 o 31)."
                      value={inputs.dias}
                      onChange={onChange}
                      tooltipAlign="right"
                    />
                  </div>
                </div>

                <hr />

                {/* Importe Actual Block */}
                <div>
                  <h3 className="text-2xl font-medium text-ink mb-4 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-soft text-brand flex items-center justify-center font-mono text-xs font-semibold">
                      3
                    </div>
                    Comparativa (opcional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <InputField
                      label="Importe actual de tu factura (€)"
                      field="importeActual"
                      tooltip="El total a pagar de tu factura actual para calcular cuánto ahorrarías."
                      value={inputs.importeActual || ""}
                      onChange={onChange}
                      required={false}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <button
                  type="submit"
                  className="w-full btn-logos py-4 text-xl"
                >
                  <span>Calcular mi factura</span>
                  <span className="btn-logos__arrow"><MoveRight className="w-5 h-5 mt-0.5 shrink-0" /></span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
