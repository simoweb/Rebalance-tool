'use client';

import React from 'react';
import { Analytics } from '@vercel/analytics/react';

export default function ClientLayout({ children }) {
  return (
    <>
      {children}
      <Analytics />
    </>
  );
} 