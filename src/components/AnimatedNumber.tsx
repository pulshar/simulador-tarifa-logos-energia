import { useEffect, useState } from 'react';
import { animate } from 'motion';

export function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number, prefix?: string, suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (v) => setDisplayValue(v)
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span>
      {prefix}{displayValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{suffix}
    </span>
  );
}
