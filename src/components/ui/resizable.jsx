"use client";

import * as React from "react";
// Importa el ícono de agarre vertical.
import { GripVerticalIcon } from "lucide-react";
// Importa los componentes base de la librería de paneles redimensionables.
import * as ResizablePrimitive from "react-resizable-panels";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente ResizablePanelGroup raíz: El contenedor principal que define la dirección (horizontal por defecto).
function ResizablePanelGroup({
  className,
  ...props
}) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        // Flexbox de ancho/alto completo. Si la dirección es vertical, usa flex-col.
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

// Componente ResizablePanel: Un contenedor individual cuyo tamaño es gestionado por el grupo.
function ResizablePanel({
  ...props
}) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

// Componente ResizableHandle: El divisor que el usuario arrastra para cambiar el tamaño de los paneles.
function ResizableHandle({
  withHandle, // Propiedad booleana opcional para mostrar un ícono de agarre visible.
  className,
  ...props
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        // Estilos base: Barra de 1px de ancho con fondo de borde.
        "bg-border relative flex w-px items-center justify-center",
        // Área de agarre (hit area): Un pseudo-elemento 'after' invisible de 1px de ancho para mejorar la usabilidad.
        "after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2",
        // Estilos de foco: anillo de 1px para accesibilidad.
        "focus-visible:ring-ring focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden",
        // Estilos condicionales para dirección vertical.
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0",
        // Rota el ícono de agarre 90 grados si la dirección es vertical.
        "[&[data-panel-group-direction=vertical]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {/* Indicador visual de agarre opcional (el ícono). */}
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
}

// Exporta los componentes.
export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
