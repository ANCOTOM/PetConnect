"use client";

import * as React from "react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Table: Envuelve la tabla con un contenedor para manejar el scroll horizontal.
function Table({ className, ...props }) {
  return (
    <div
      data-slot="table-container"
      // Hace que la tabla sea responsiva permitiendo el scroll horizontal (overflow-x-auto).
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        // Estilos base de la tabla: ancho completo, texto pequeño y caption en la parte inferior.
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

// Componente TableHeader: Encabezado de la tabla (<thead>).
function TableHeader({ className, ...props }) {
  return (
    <thead
      data-slot="table-header"
      // Aplica un borde inferior a cada fila (<tr>) dentro del thead.
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

// Componente TableBody: Cuerpo de la tabla (<tbody>).
function TableBody({ className, ...props }) {
  return (
    <tbody
      data-slot="table-body"
      // Elimina el borde inferior de la última fila (<tr>) del tbody.
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

// Componente TableFooter: Pie de página de la tabla (<tfoot>).
function TableFooter({ className, ...props }) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        // Estilos para el pie: fondo, borde superior y fuente media.
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

// Componente TableRow: Fila de la tabla (<tr>).
function TableRow({ className, ...props }) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        // Borde inferior y transición de color para hover y estado seleccionado.
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className,
      )}
      {...props}
    />
  );
}

// Componente TableHead: Celda de encabezado de la tabla (<th>).
function TableHead({ className, ...props }) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        // Estilos para la celda de encabezado: altura, padding, alineación, texto truncado.
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap",
        // Ajustes para columnas que contienen checkboxes.
        "md:[&:has([role=checkbox])]:pr-0 md:[&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

// Componente TableCell: Celda de datos de la tabla (<td>).
function TableCell({ className, ...props }) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        // Estilos para la celda: padding, alineación y texto truncado.
        "p-2 align-middle whitespace-nowrap",
        // Ajustes para columnas que contienen checkboxes.
        "md:[&:has([role=checkbox])]:pr-0 md:[&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

// Componente TableCaption: Leyenda o descripción de la tabla (<caption>).
function TableCaption({
  className,
  ...props
}) {
  return (
    <caption
      data-slot="table-caption"
      // Estilos para la leyenda: margen superior y texto secundario.
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

// Exporta todos los subcomponentes.
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
