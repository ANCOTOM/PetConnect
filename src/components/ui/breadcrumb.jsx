import * as React from "react";
// Slot: Permite que un componente se renderice como su hijo (funcionalidad 'asChild').
import { Slot } from "@radix-ui/react-slot";
// ChevronRight y MoreHorizontal: Iconos de la librería lucide-react.
import { ChevronRight, MoreHorizontal } from "lucide-react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente raíz que actúa como el contenedor de navegación principal (etiqueta <nav>).
function Breadcrumb(props) {
  // role="navigation" implícito por <nav>. aria-label es esencial para la accesibilidad.
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

// Componente que envuelve la lista de elementos (etiqueta <ol>).
function BreadcrumbList({ className, ...props }) {
  return (
    <ol
      data-slot="breadcrumb-list"
      // Clases para el diseño flex, espaciado y manejo de saltos de línea.
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className,
      )}
      {...props}
    />
  );
}

// Componente individual que contiene un enlace, separador, o texto de página actual (etiqueta <li>).
function BreadcrumbItem({ className, ...props }) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

// Componente para un enlace navegable dentro de la ruta (etiqueta <a> o Slot).
function BreadcrumbLink({ asChild, className, ...props }) {
  // Permite renderizar como un enlace interno de router (Slot) o una etiqueta <a> estándar.
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="breadcrumb-link"
      // Estilo de hover para indicar interactividad.
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  );
}

// Componente para el último elemento de la ruta (página actual), que no es un enlace.
function BreadcrumbPage({ className, ...props }) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      // Indica a los lectores de pantalla que esta es la página actual.
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  );
}

// Componente para el separador visual entre elementos (etiqueta <li>).
function BreadcrumbSeparator({ children, className, ...props }) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {/* Si no se pasa un hijo, usa la flecha derecha por defecto. */}
      {children ?? <ChevronRight />}
    </li>
  );
}

// Componente para indicar elementos de ruta ocultos (...).
function BreadcrumbEllipsis({ className, ...props }) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      {/* Ícono de puntos horizontales. */}
      <MoreHorizontal className="size-4" />
      {/* Texto oculto para lectores de pantalla. */}
      <span className="sr-only">More</span>
    </span>
  );
}

// Exporta todos los componentes para que se puedan usar juntos.
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};