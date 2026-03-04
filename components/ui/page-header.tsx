'use client';

import React from 'react';

interface PageHeaderProps {
  /** Main title (uses app-title styling) */
  title: string;
  /** Subtitle description */
  subtitle: string;
}

/**
 * Reusable page header with consistent title and subtitle styling.
 * Matches the design pattern used across Vote, Feedback, etc.
 */
export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl app-title">{title}</h1>
      <p className="text-muted-foreground text-sm font-medium">{subtitle}</p>
    </div>
  );
}
