/**
 * Tenant Layout
 * Layout principal para las páginas del tenant
 */

import React from 'react';

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>{children}</main>
    </div>
  );
}
