// src/shared/components/ui/Calendar/calendar.tsx
import React from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { CalendarProps } from './types';

export const Calendar: React.FC<CalendarProps> = ({
  mode = 'single',
  selected,
  onSelect,
  className,
  locale = es,
  modifiers,
  modifiersStyles,
}) => {
  return (
    <DayPicker
      mode={mode}
      selected={selected as any}
      onSelect={onSelect as any}
      locale={locale}
      className={`p-3 bg-white ${className}`}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-neutral-900",
        nav: "space-x-1 flex items-center",
        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-neutral-500 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-spoon-primary/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-spoon-primary/10 rounded-md",
        day_selected: "bg-spoon-primary text-white hover:bg-spoon-primary hover:text-white focus:bg-spoon-primary focus:text-white",
        day_today: "bg-neutral-100",
        day_outside: "text-neutral-400 opacity-50",
        day_disabled: "text-neutral-400 opacity-50",
        day_range_middle: "aria-selected:bg-spoon-primary/5 aria-selected:text-neutral-900",
        day_hidden: "invisible",
      }}
      modifiers={modifiers}
      modifiersStyles={modifiersStyles}
    />
  );
};



























