"use client";

import * as React from "react";
// Importa el hook principal para la funcionalidad de carrusel.
import useEmblaCarousel from "embla-carousel-react";
// Íconos para los botones de navegación.
import { ArrowLeft, ArrowRight } from "lucide-react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";
// Componente Button (se asume que existe en ./button).
import { Button } from "./button";

// Contexto para compartir la API del carrusel, el estado de desplazamiento y las funciones entre subcomponentes.
const CarouselContext = React.createContext(null);

// Hook personalizado para acceder a los datos del contexto del carrusel.
function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    // Lanza un error si el hook se usa fuera del componente <Carousel />.
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

// Componente Carousel principal. Maneja la lógica y el estado del carrusel.
function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}) {
  // Inicializa el carrusel con el hook de Embla.
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      // Define el eje de desplazamiento basado en la orientación ('x' o 'y').
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );
  // Estado para saber si se puede desplazar a la diapositiva anterior/siguiente.
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  // Callback para actualizar el estado de desplazamiento.
  const onSelect = React.useCallback((api) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  // Función para desplazarse a la diapositiva anterior.
  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  // Función para desplazarse a la diapositiva siguiente.
  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  // Maneja la navegación con las teclas de flecha (izquierda/derecha).
  const handleKeyDown = React.useCallback(
    (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  // Efecto para exponer la API de Embla si se proporciona 'setApi'.
  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  // Efecto para manejar eventos de la API de Embla (selección de diapositiva y reinicio).
  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    // Función de limpieza para desregistrar el oyente de eventos.
    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  // Provee el contexto a todos los subcomponentes.
  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        // Captura el evento de teclado para permitir la navegación.
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

// Contenedor de la vista del carrusel (donde ocurre el desplazamiento).
function CarouselContent({ className, ...props }) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      // Aplica la ref del carrusel aquí para que Embla pueda medir y controlar el desplazamiento.
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        // Contenedor interno que aplica el desplazamiento negativo para el espaciado.
        className={cn(
          "flex",
          // Aplica margen negativo y disposición flex basada en la orientación.
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  );
}

// Elemento individual (diapositiva) dentro del carrusel.
function CarouselItem({ className, ...props }) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        // Asegura que cada elemento tome el ancho completo y no se reduzca.
        "min-w-0 shrink-0 grow-0 basis-full",
        // Aplica padding basado en la orientación para compensar el margen negativo del contenedor.
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
}

// Botón para navegar a la diapositiva anterior.
function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        // Posicionamiento absoluto y transformación basada en la orientación.
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      // Deshabilita el botón si no se puede desplazar más.
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      {/* Texto solo para lectores de pantalla. */}
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

// Botón para navegar a la diapositiva siguiente.
function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        // Posicionamiento absoluto y transformación basada en la orientación.
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      // Deshabilita el botón si no se puede desplazar más.
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      {/* Texto solo para lectores de pantalla. */}
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

// Exporta los componentes principales.
export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};