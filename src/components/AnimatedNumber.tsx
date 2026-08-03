import { animate } from "motion";
import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  onComplete?: () => void;
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  onComplete,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (v) => setDisplayValue(v),
      onComplete,
    });
    return () => controls.stop();
  }, [value, onComplete]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
      {suffix}
    </span>
  );
}
