import * as React from "react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Card raíz: el contenedor principal para agrupar contenido.
function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      // Estilos base: fondo, texto, flex layout, esquinas redondeadas y borde.
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className,
      )}
      {...props}
    />
  );
}

// Componente CardHeader: Sección superior para el título, descripción y acciones.
function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      // Estilos de grid para la disposición del título, descripción y botón de acción.
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

// Componente CardTitle: El título principal de la tarjeta (usa un <h4>).
function CardTitle({ className, ...props }) {
  return (
    <h4
      data-slot="card-title"
      // Estilos mínimos (font-size y line-height suelen ser definidos por la hoja de estilos global).
      className={cn("leading-none", className)}
      {...props}
    />
  );
}

// Componente CardDescription: Texto secundario, a menudo debajo del título (usa <p>).
function CardDescription({ className, ...props }) {
  return (
    <p
      data-slot="card-description"
      // Usa un color de texto silenciado (muted-foreground).
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

// Componente CardAction: Contenedor para botones o menús que deben alinearse en la esquina del header.
function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      // Posiciona el contenido en el grid del CardHeader (columna 2, abarcando 2 filas).
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

// Componente CardContent: El cuerpo principal y flexible de la tarjeta.
function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      // Aplica padding horizontal y asegura que el último hijo tenga padding inferior.
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

// Componente CardFooter: La sección inferior de la tarjeta, a menudo para botones finales o metadata.
function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      // Aplica padding horizontal e inferior, y centra verticalmente el contenido.
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

// Exporta todos los componentes para su uso modular.
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};