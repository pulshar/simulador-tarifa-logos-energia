import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { UserInputs, CalculationResult } from './types';
import { calcularFactura } from './lib/calculator';
import { LOGOS_ENERGIA_CONFIG } from './lib/config';
import { Step1Form } from './components/Step1Form';
import { Step2Results } from './components/Step2Results';

export default function App() {
  const [step, setStep] = useState<1 | 2>(1);
  const [inputs, setInputs] = useState<UserInputs>({
    potenciaP1: 4.6,
    potenciaP2: 4.6,
    consumoP1: 100,
    consumoP2: 100,
    consumoP3: 100,
    dias: 30,
  });
  
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleInputChange = (field: keyof UserInputs, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    const res = calcularFactura(inputs, LOGOS_ENERGIA_CONFIG);
    setResult(res);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(2);
  };

  const handleReset = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col pt-12 pb-24 px-4 md:px-8 bg-bg-warm selection:bg-accent/30 selection:text-ink">
      <main className="flex-1 w-full flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <Step1Form 
              key="step1" 
              inputs={inputs} 
              onChange={handleInputChange} 
              onSubmit={handleCalculate} 
              onFileParsed={(data) => setInputs(prev => ({ ...prev, ...data }))}
            />
          )}
          
          {step === 2 && result && (
            <Step2Results 
              key="step2" 
              result={result}
              importeActual={inputs.importeActual}
              onReset={handleReset} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
