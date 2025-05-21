// src/shared/components/ui/RadioGroup/types.ts
import { ComponentPropsWithoutRef, ElementRef } from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"

export type RadioGroupProps = ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
export type RadioGroupItemProps = ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
export type RadioGroupRef = ElementRef<typeof RadioGroupPrimitive.Root>
export type RadioGroupItemRef = ElementRef<typeof RadioGroupPrimitive.Item>