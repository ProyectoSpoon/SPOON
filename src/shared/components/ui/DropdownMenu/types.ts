// src/shared/components/ui/DropdownMenu/types.ts
import { ComponentPropsWithoutRef, ElementRef } from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"

export type DropdownMenuProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>
export type DropdownMenuTriggerProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
export type DropdownMenuContentProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
export type DropdownMenuItemProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
export type DropdownMenuRef = ElementRef<typeof DropdownMenuPrimitive.Content>