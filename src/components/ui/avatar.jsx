"use client";

import * as React from "react";
// Importa los componentes base de Radix UI para construir el avatar.
import * as AvatarPrimitive from "@radix-ui/react-avatar";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente raíz (contenedor) del avatar.
function Avatar({ className, ...props }) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      // Define el tamaño, forma redonda y manejo del desbordamiento (overflow: hidden).
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
}

// Componente para mostrar la imagen real del avatar.
function AvatarImage({ className, ...props }) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      // Asegura que la imagen mantenga la relación de aspecto y cubra el tamaño completo del contenedor.
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

// Componente de reserva (fallback) que se muestra si la imagen no se carga.
function AvatarFallback({ className, ...props }) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      // Define el fondo, y centra el contenido (texto o iniciales).
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  );
}

// Exporta los componentes para su uso.
export { Avatar, AvatarImage, AvatarFallback };