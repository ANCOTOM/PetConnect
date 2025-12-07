// "use client";

import * as React from "react";
// Importa todos los componentes base de Radix UI Tooltip.
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

// Importa una función de utilidad para concatenar clases condicionalmente.
import { cn } from "./utils";

// Componente Wrapper (Proveedor) del Tooltip.
// Se eliminaron las anotaciones de tipo de las props.
function TooltipProvider({
  // Establece la duración del retraso en 0ms por defecto.
  delayDuration = 0,
  ...props
}) {
  // Renderiza el componente base Provider de Radix.
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration} // Pasa la duración del retraso.
      {...props}
    />
  );
}

// Componente Raíz del Tooltip.
// Se eliminaron las anotaciones de tipo de las props.
function Tooltip({
  ...props
}) {
  // Envuelve TooltipPrimitive.Root con TooltipProvider por conveniencia.
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

// Componente que define el elemento que activará el Tooltip.
// Se eliminaron las anotaciones de tipo de las props.
function TooltipTrigger({
  ...props
}) {
  // Renderiza el componente base Trigger de Radix.
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

// Componente que contiene el contenido visible del Tooltip.
// Se eliminaron las anotaciones de tipo de las props.
function TooltipContent({
  className,
  sideOffset = 0, // Desplazamiento del contenido respecto al trigger.
  children,
  ...props
}) {
  // TooltipPrimitive.Portal asegura que el contenido se renderice fuera del flujo DOM actual (al final del body).
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        // Aplica clases de estilo y animación usando 'cn' y Tailwind CSS.
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className,
        )}
        {...props}
      >
        {children}
        {/* Componente Arrow (la 'flechita') para apuntar al trigger. */}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

// Exporta los componentes para ser utilizados en otros archivos.
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
