"use client";

import * as React from "react";
// Importa los componentes base de Radix UI para construir el diálogo de alerta.
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";
// Utilidad para obtener las variantes de estilo del botón.
import { buttonVariants } from "./button";


// Componente raíz que maneja el estado del diálogo (abierto/cerrado).
function AlertDialog(props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

// Componente que, al ser activado, abre el diálogo de alerta.
function AlertDialogTrigger(props) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

// Componente que permite renderizar el contenido del diálogo fuera del árbol DOM principal (útil para superposiciones).
function AlertDialogPortal(props) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

// Componente de superposición (fondo oscuro) que se coloca detrás del diálogo.
const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <AlertDialogPrimitive.Overlay
      ref={ref}
      data-slot="alert-dialog-overlay"
      // Clases para el fondo semi-transparente fijo y las animaciones de fade.
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
});
AlertDialogOverlay.displayName = "AlertDialogOverlay";

// Componente principal que contiene el cuerpo y el contenido del diálogo (se centra en la pantalla).
function AlertDialogContent({ className, ...props }) {
  return (
    <AlertDialogPortal>
      {/* Añade el fondo oscuro */}
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        // Clases para el posicionamiento, el tamaño, el estilo y las animaciones de zoom.
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

// Contenedor para el encabezado (título y descripción).
function AlertDialogHeader({ className, ...props }) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

// Contenedor para los botones de acción (pie de página).
function AlertDialogFooter({ className, ...props }) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

// Componente para el texto principal del título.
function AlertDialogTitle({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

// Componente para el texto de descripción o cuerpo del diálogo.
function AlertDialogDescription({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

// Botón de acción principal (ej. Confirmar, Borrar) que dispara la acción del diálogo.
function AlertDialogAction({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Action
      // Aplica el estilo de botón por defecto.
      className={cn(buttonVariants(), className)}
      {...props}
    />
  );
}

// Botón para cancelar o cerrar el diálogo.
function AlertDialogCancel({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Cancel
      // Aplica el estilo de botón 'outline' (esquema) para diferenciarlo de la acción principal.
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
}

// Exporta todos los subcomponentes para su uso externo.
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};