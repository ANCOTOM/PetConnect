"use client";

import * as React from "react";
// Importa el componente Label primitivo de Radix UI para asegurar la accesibilidad.
import * as LabelPrimitive from "@radix-ui/react-label";
// Importa Slot de Radix, que permite renderizar como cualquier elemento o componente hijo.
import { Slot } from "@radix-ui/react-slot";
// Importa hooks y tipos de react-hook-form.
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
} from "react-hook-form";

// Importa utilidades y el componente Label estilizado.
import { cn } from "./utils";
import { Label } from "./label";

// El componente principal del formulario, usa el FormProvider de react-hook-form.
const Form = FormProvider;

// --- Contextos para compartir estado ---

// 1. FormFieldContext: Comparte el 'name' (nombre del campo) del formulario.
const FormFieldContext = React.createContext(
  {}
);

// 2. FormItemContext: Comparte un 'id' único para enlazar Label, Input, Description y Message.
const FormItemContext = React.createContext(
  {}
);

// --- Hooks ---

// useFormField: Hook para acceder a toda la metadata y estado de un campo.
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  // Obtiene la API del formulario.
  const { getFieldState } = useFormContext();
  // Obtiene el estado global (errors, dirtyFields) para el campo específico.
  const formState = useFormState({ name: fieldContext.name });
  // Obtiene el estado detallado del campo (error, isDirty, isValidating, etc.).
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  // Retorna las propiedades de estado y los IDs únicos para la accesibilidad (aria-).
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

// --- Componentes ---

// FormField: Envuelve el Controller de react-hook-form y provee el name al contexto.
const FormField = ({
  ...props
}) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

// FormItem: Contenedor para un campo completo (Label, Input, Message). Genera el ID único.
function FormItem({ className, ...props }) {
  const id = React.useId(); // Genera un ID único para la accesibilidad.

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        // Clases base para el diseño (gap-2).
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

// FormLabel: Etiqueta del campo. Se enlaza al input a través del `htmlFor`.
function FormLabel({
  className,
  ...props
}) {
  const { error, formItemId } = useFormField(); // Obtiene el estado y el ID.

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      // Cambia el color del texto a 'destructive' si hay un error.
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId} // Enlaza la etiqueta al FormControl (Input).
      {...props}
    />
  );
}

// FormControl: El componente de entrada (Input, Select, Textarea, etc.).
function FormControl({ ...props }) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot // Permite que el elemento renderizado sea el componente hijo (p. ej., <Input />).
      data-slot="form-control"
      id={formItemId}
      // Establece los atributos aria-describedby para leer la descripción y/o el mensaje de error.
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error} // Indica si el campo es inválido.
      {...props}
    />
  );
}

// FormDescription: Texto de ayuda o descripción del campo.
function FormDescription({ className, ...props }) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      // Estilos de texto silenciado.
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

// FormMessage: Muestra el mensaje de error del campo.
function FormMessage({ className, ...props }) {
  const { error, formMessageId } = useFormField();
  // Obtiene el mensaje del objeto 'error' de react-hook-form o usa children si no hay error.
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null; // No renderiza si no hay mensaje.
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      // Estilos de texto destructivo (rojo).
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  );
}

// Exporta todos los componentes y el hook.
export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};