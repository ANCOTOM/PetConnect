import * as React from "react";
// Importa íconos para navegación (izquierda, derecha) y elipsis.
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";
// Importa Button y buttonVariants (se asume que definen la estilización de los botones).
import { Button, buttonVariants } from "./button";

// Componente Pagination raíz: Contenedor principal para la accesibilidad de navegación.
function Pagination({ className, ...props }) {
  return (
    <nav
      role="navigation" // Rol de navegación para accesibilidad.
      aria-label="pagination" // Etiqueta accesible.
      data-slot="pagination"
      className={cn(
        // Centra el contenido horizontalmente.
        "mx-auto flex w-full justify-center",
        className,
      )}
      {...props}
    />
  );
}

// Componente PaginationContent: La lista que contiene los ítems (números, flechas, elipsis).
function PaginationContent({
  className,
  ...props
}) {
  return (
    <ul
      data-slot="pagination-content"
      // Lista flex con ítems centrados y un pequeño espacio entre ellos.
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

// Componente PaginationItem: Un contenedor <li> para cada elemento de la paginación.
function PaginationItem({ ...props }) {
  return <li data-slot="pagination-item" {...props} />;
}

// Componente PaginationLink: El enlace clickable para cambiar de página.
function PaginationLink({
  className,
  isActive, // Indica si es la página actual.
  size = "icon", // Tamaño por defecto: icono (cuadrado).
  ...props
}) {
  return (
    <a
      // Atributo aria-current para indicar la página activa a tecnologías de asistencia.
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        // Aplica las variantes de estilo de botón.
        buttonVariants({
          // La página activa usa el estilo 'outline', las demás 'ghost'.
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

// Componente PaginationPrevious: Enlace para ir a la página anterior.
function PaginationPrevious({
  className,
  ...props
}) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default" // Tamaño predeterminado (más ancho que 'icon').
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      {/* Etiqueta de texto oculta en móvil, visible en 'sm' y superior. */}
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

// Componente PaginationNext: Enlace para ir a la página siguiente.
function PaginationNext({
  className,
  ...props
}) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      {/* Etiqueta de texto oculta en móvil, visible en 'sm' y superior. */}
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

// Componente PaginationEllipsis: Indicador de páginas omitidas.
function PaginationEllipsis({
  className,
  ...props
}) {
  return (
    <span
      aria-hidden // Oculta a tecnologías de asistencia ya que es decorativo.
      data-slot="pagination-ellipsis"
      // Tamaño fijo similar al de los botones de página.
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      {/* Texto auxiliar solo para lectores de pantalla. */}
      <span className="sr-only">More pages</span>
    </span>
  );
}

// Exporta todos los componentes.
export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};