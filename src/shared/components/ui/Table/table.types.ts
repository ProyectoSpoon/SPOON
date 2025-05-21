import { ReactNode } from 'react';

export interface TableProps {
  children: ReactNode;
  className?: string;
}

export interface TableHeaderProps extends TableProps {
  sticky?: boolean;
}

export interface TableCellProps extends TableProps {
  align?: 'left' | 'center' | 'right';
  variant?: 'default' | 'numeric' | 'actions';
  colSpan?: number;
}

export interface TableRowProps extends TableProps {
  selected?: boolean;
  clickable?: boolean;
}

/**
 * Prop Types for DataTable Compound Components
 */
export interface DataTableProps {
  Root: React.FC<TableProps>;
  Header: React.FC<TableHeaderProps>;
  Body: React.FC<TableProps>;
  Row: React.FC<TableRowProps>;
  Cell: React.FC<TableCellProps>;
  HeaderCell: React.FC<TableCellProps>;
}

export type TableComponent = {
  Root: React.FC<TableProps>;
  Header: React.FC<TableHeaderProps>;
  Body: React.FC<TableProps>;
  Row: React.FC<TableRowProps>;
  Cell: React.FC<TableCellProps>;
  HeaderCell: React.FC<TableCellProps>;
};