import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Rebalance Tool - Ribilanciamento del Portafoglio',
  description: 'Strumento per il ribilanciamento del portafoglio di investimenti',
};

import ClientLayout from './ClientLayout';

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="bg-gray-50">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
} 