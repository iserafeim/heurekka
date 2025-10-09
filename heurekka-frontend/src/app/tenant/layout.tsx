/**
 * Tenant Layout
 * Layout principal para las páginas del tenant que incluye navbar
 */

import React from 'react';
import { HeroHeader } from '@/components/header';

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <HeroHeader />
      <main className="pt-20">{children}</main>
    </div>
  );
}
