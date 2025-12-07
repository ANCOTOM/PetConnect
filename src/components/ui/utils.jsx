//: Importa la librería 'clsx', que permite construir cadenas de clases
// de manera condicional y fácil a partir de arrays, objetos o strings.
import { clsx } from "clsx";
//: Importa la librería 'tailwind-merge', que resuelve conflictos
// de clases de Tailwind CSS (ej: si pones 'p-4' y 'p-2', se queda solo con 'p-2').
import { twMerge } from "tailwind-merge";

//: Función principal que toma una lista de entradas (strings, objetos, arrays)
// y las procesa para producir una única y limpia cadena de clases CSS.
// Se eliminaron la importación de tipo y la anotación de tipo del argumento.
export function cn(...inputs) {
//: 1. clsx(inputs): Combina las clases condicionalmente.
//: 2. twMerge(...): Resuelve cualquier conflicto entre clases de Tailwind.
  return twMerge(clsx(inputs));
}

