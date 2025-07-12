// src/shared/components/ui/Table/table.tsx
import React from 'react';
import { 
  TableProps, 
  TableHeaderProps, 
  TableCellProps, 
  TableRowProps 
} from './table.types';

const Table = ({ children, className = '', ...props }: TableProps) => (
  <div className={`w-full overflow-x-auto border border-neutral-200 rounded-lg ${className}`}>
    <table className="min-w-full divide-y divide-neutral-200" {...props}>
      {children}
    </table>
  </div>
);

const Header = ({ children, sticky = false, className = '', ...props }: TableHeaderProps) => (
  <thead 
    className={`bg-[#FFF9F2] text-neutral-700 ${sticky ? 'sticky top-0' : ''} ${className}`}
    {...props}
  >
    {children}
  </thead>
);

const Body = ({ children, className = '', ...props }: TableProps) => (
  <tbody 
    className={`bg-white divide-y divide-neutral-200 ${className}`}
    {...props}
  >
    {children}
  </tbody>
);

const Row = ({ 
  children, 
  selected = false,
  clickable = false,
  className = '', 
  ...props 
}: TableRowProps) => (
  <tr 
    className={`
      ${selected ? 'bg-[#FFF9F2]' : 'bg-white hover:bg-[#FFF9F2]'}
      ${clickable ? 'cursor-pointer' : ''}
      transition-colors duration-150
      ${className}
    `}
    {...props}
  >
    {children}
  </tr>
);

const Cell = ({ 
  children, 
  align = 'left',
  variant = 'default',
  className = '', 
  ...props 
}: TableCellProps) => {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const variantStyles = {
    default: 'text-neutral-600',
    numeric: 'text-neutral-700 font-medium tabular-nums',
    actions: 'text-neutral-500'
  };

  return (
    <td 
      className={`
        px-6 py-4 text-sm whitespace-nowrap
        ${alignStyles[align]}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </td>
  );
};

const HeaderCell = ({ 
  children, 
  align = 'left',
  className = '', 
  ...props 
}: TableCellProps) => (
  <th 
    className={`
      px-6 py-3 text-sm font-semibold
      text-neutral-700 uppercase tracking-wider
      ${align === 'right' ? 'text-right' : 'text-left'}
      ${className}
    `}
    {...props}
  >
    {children}
  </th>
);

export const DataTable = {
  Root: Table,
  Header,
  Body,
  Row,
  Cell,
  HeaderCell,
};
