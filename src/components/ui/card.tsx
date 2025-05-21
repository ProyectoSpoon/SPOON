// src/components/ui/Card.tsx
import React from 'react';

export const Card = ({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <header className={`mb-4 ${className}`} role="heading" aria-level={2}>
      {children}
    </header>
  );
};

export const CardTitle = ({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h3 className={`text-xl font-bold ${className}`} role="heading" aria-level={3}>
      {children}
    </h3>
  );
};

export const CardContent = ({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={className} role="region" aria-label="Content">
      {children}
    </div>
  );
};