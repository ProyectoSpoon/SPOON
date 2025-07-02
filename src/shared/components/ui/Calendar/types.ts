// src/shared/components/ui/Calendar/types.ts
export interface CalendarProps {
    mode?: 'single' | 'multiple' | 'range';
    selected?: Date | Date[] | null;
    onSelect?: (date: Date | null) => void;
    className?: string;
    locale?: any;
    modifiers?: {
      [key: string]: Date[];
    };
    modifiersStyles?: {
      [key: string]: React.CSSProperties;
    };
  }
