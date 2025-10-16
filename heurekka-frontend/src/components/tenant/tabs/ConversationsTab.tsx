'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';

export function ConversationsTab() {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-shadow duration-300 p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Conversaciones
        </h2>
      </div>

      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-inner">
          <MessageSquare className="h-12 w-12 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Sin conversaciones aún
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Las conversaciones con propietarios aparecerán aquí cuando contactes propiedades de tu interés
        </p>
        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl max-w-md mx-auto border border-blue-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-2">💡 Tip</p>
          <p className="text-sm text-gray-700">
            Contacta propiedades desde la página de búsqueda o desde tus favoritos
          </p>
        </div>
      </div>
    </section>
  );
}
