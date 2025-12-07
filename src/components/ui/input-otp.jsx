"use client";

import * as React from "react";
// Importa los componentes y el contexto principal de la librería 'input-otp'.
import { OTPInput, OTPInputContext } from "input-otp";
// Ícono de guion/separador de Lucide.
import { MinusIcon } from "lucide-react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente InputOTP raíz: El contenedor principal que proporciona la lógica de la OTP.
function InputOTP({
  className,
  containerClassName, // Clases para el contenedor FLEX externo (usado para separar grupos).
  ...props
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      // Estilos para el contenedor principal de la OTP.
      containerClassName={cn(
        // Flexbox para alinear ítems, gap entre grupos, y opacidad para deshabilitado.
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName,
      )}
      // Estilos para el input oculto real (accesibilidad).
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

// Componente InputOTPGroup: Contenedor para agrupar slots adyacentes (ej. "123" "-" "456").
function InputOTPGroup({ className, ...props }) {
  return (
    <div
      data-slot="input-otp-group"
      // Contenedor flex con un gap pequeño entre los slots individuales.
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

// Componente InputOTPSlot: La celda individual donde se muestra un dígito.
function InputOTPSlot({
  index, // Propiedad requerida para obtener el estado de la celda.
  className,
  ...props
}) {
  // Accede al contexto para obtener el carácter, el caret y el estado activo.
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive} // Estado activo para foco visual.
      className={cn(
        // Estilos base: tamaño, centrado, borde, fondo.
        "border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm bg-input-background transition-all outline-none",
        // Estilos para esquinas y bordes: el primer slot tiene borde izquierdo y redondeo izquierdo.
        "first:rounded-l-md first:border-l last:rounded-r-md",
        // Estilos para el estado activo (foco): alto z-index, borde y anillo (ring).
        "data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-[3px] data-[active=true]:ring-ring/50",
        // Estilos para errores (aria-invalid).
        "data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive",
        // Estilos de fondo para modo oscuro.
        "dark:bg-input/30",
        className,
      )}
      {...props}
    >
      {/* El carácter ingresado, proporcionado por el contexto. */}
      {char}
      {/* Lógica para mostrar el cursor parpadeante simulado (fake caret). */}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

// Componente InputOTPSeparator: Un guion u otro elemento para separar grupos de slots.
function InputOTPSeparator({ ...props }) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      {/* Ícono de guion como separador visual. */}
      <MinusIcon />
    </div>
  );
}

// Exporta todos los componentes.
export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };