"use client";

import * as React from "react";
// Importa los componentes base de Slider de Radix UI.
import * as SliderPrimitive from "@radix-ui/react-slider";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Slider principal.
function Slider({
  className,
  defaultValue,
  value,
  min = 0, // Valor mínimo del rango.
  max = 100, // Valor máximo del rango.
  ...props
}) {
  // Memoiza y determina el array de valores actual para saber cuántos "pulgares" renderizar.
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max], // Si no hay valores definidos, usa [min, max] para asegurar al menos dos thumbs si se usa Range.
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        // Estilos base: Flexbox, ancho completo y deshabilitación de interacciones táctiles/selección.
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50",
        // Estilos condicionales para orientación vertical (altura y diseño flex-col).
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      {/* Pista (Track): La barra estacionaria del control deslizante. */}
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full",
          // Altura/ancho para orientación horizontal y vertical.
          "data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
        )}
      >
        {/* Rango (Range): La sección coloreada del track que indica el valor actual. */}
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute",
            // Ajuste de dimensión para el rango.
            "data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
        />
      </SliderPrimitive.Track>
      {/* Pulgares (Thumbs): Los controles arrastrables. Se renderiza uno por cada valor en _values. */}
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

// Exporta el componente.
export { Slider };