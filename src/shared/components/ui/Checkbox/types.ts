// src/shared/components/ui/checkbox/types.ts
import { ComponentPropsWithoutRef, ElementRef } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

export interface CheckboxProps extends ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /**
   * El estado del checkbox
   */
  checked?: boolean;
  /**
   * Callback que se ejecuta cuando cambia el estado
   */
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
  /**
   * Indica si el checkbox está deshabilitado
   */
  disabled?: boolean;
  /**
   * Indica si el checkbox está en estado requerido
   */
  required?: boolean;
  /**
   * El nombre del checkbox para formularios
   */
  name?: string;
  /**
   * El valor del checkbox
   */
  value?: string;
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

export type CheckboxElement = ElementRef<typeof CheckboxPrimitive.Root>;