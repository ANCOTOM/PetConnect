"use client";

import * as React from "react";
// Importa los íconos de flecha (izquierda/derecha) para la navegación.
import { ChevronLeft, ChevronRight } from "lucide-react";
// Importa el componente base de calendario de 'react-day-picker'.
import { DayPicker } from "react-day-picker";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";
// Utilidad para obtener las clases de estilo de botón.
import { buttonVariants } from "./button";

// Componente Calendar que envuelve y estiliza DayPicker.
function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      // Clases generales aplicadas al contenedor del calendario.
      className={cn("p-3", className)}
      // Mapea las propiedades de estilo internas del DayPicker a clases CSS personalizadas.
      classNames={{
        // Define la estructura de los meses (apilados en móvil, lado a lado en escritorio).
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        // Contenedor de la cabecera (título del mes y botones de navegación).
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        // Estilo de los botones de navegación (anterior/siguiente).
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        // Posiciona los botones de navegación absolutos a los lados.
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        // Estilo de las celdas de la cabecera (días de la semana).
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        // Estilo de las celdas individuales del día.
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          // Lógica para aplicar rounded-md al inicio/fin del rango de selección.
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        // Estilo de los números de día (usando variantes de botón 'ghost').
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100",
        ),
        // Estilos específicos para el inicio y fin de un rango seleccionado.
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        // Estilo del día individual seleccionado.
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        // Estilo del día actual.
        day_today: "bg-accent text-accent-foreground",
        // Estilo de los días fuera del mes actual.
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        // Estilo para días deshabilitados.
        day_disabled: "text-muted-foreground opacity-50",
        // Estilo de los días dentro del rango (medio).
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      // Reemplaza los íconos de navegación predeterminados con íconos de Lucide.
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

// Exporta el componente Calendar.
export { Calendar };