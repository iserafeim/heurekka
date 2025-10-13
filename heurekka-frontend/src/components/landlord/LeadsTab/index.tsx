/**
 * Leads Tab Component
 * Main container for lead management
 */

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Inbox, RefreshCcw, Trash2, CheckCircle2 } from 'lucide-react';
import { useLandlordLeads, LeadFilters as LeadFiltersType } from '@/hooks/landlord/useLandlordLeads';
import { LeadCard, Lead } from './LeadCard';
import { LeadFilters } from './LeadFilters';
import { LeadDetailPanel } from './LeadDetailPanel';
import { ResponseModal } from '../ResponseModal';
import { toast } from 'sonner';

export function LeadsTab() {
  const [filters, setFilters] = React.useState<LeadFiltersType>({});
  const [selectedLeads, setSelectedLeads] = React.useState<Set<string>>(new Set());
  const [detailLeadId, setDetailLeadId] = React.useState<string | null>(null);
  const [responseLeadId, setResponseLeadId] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);

  const {
    leads,
    totalCount,
    hasMore,
    isLoading,
    refetch,
    markAsRead,
    updateStatus,
    respond,
    bulkUpdate,
    isMarkingAsRead,
    isUpdatingStatus,
    isBulkUpdating,
  } = useLandlordLeads(filters, { page, limit: 20 });

  const responseLead = leads.find((l) => l.id === responseLeadId) || null;

  const handleSelectLead = (leadId: string, selected: boolean) => {
    const newSelection = new Set(selectedLeads);
    if (selected) {
      newSelection.add(leadId);
    } else {
      newSelection.delete(leadId);
    }
    setSelectedLeads(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(leads.map((l) => l.id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedLeads.size === 0) return;

    try {
      await bulkUpdate({
        leadIds: Array.from(selectedLeads),
        updates: { status: 'viewed' },
      });
      setSelectedLeads(new Set());
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleBulkArchive = async () => {
    if (selectedLeads.size === 0) return;

    if (!confirm(`¿Archivar ${selectedLeads.size} leads?`)) return;

    try {
      await bulkUpdate({
        leadIds: Array.from(selectedLeads),
        updates: { status: 'completed' },
      });
      setSelectedLeads(new Set());
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleWhatsApp = (leadId: string) => {
    setResponseLeadId(leadId);
  };

  const handleEmail = (leadId: string) => {
    setResponseLeadId(leadId);
  };

  const handleSendResponse = async (
    method: 'whatsapp' | 'email' | 'phone',
    message: string,
    templateId?: string
  ) => {
    if (!responseLeadId) return;

    await respond({
      leadId: responseLeadId,
      method,
      message,
      templateId,
    });
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <LeadFilters
          filters={filters}
          onFilterChange={(newFilters) => {
            setFilters(newFilters);
            setPage(1);
          }}
          onReset={handleResetFilters}
        />
      </div>

      {/* Leads List */}
      <div className="lg:col-span-3 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
            {!isLoading && (
              <span className="text-sm text-muted-foreground">
                {totalCount} {totalCount === 1 ? 'lead' : 'leads'}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl shadow-sm hover:shadow-md transition-all"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Bulk Actions Bar */}
        {selectedLeads.size > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedLeads.size === leads.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium text-blue-900">
                {selectedLeads.size} {selectedLeads.size === 1 ? 'lead seleccionado' : 'leads seleccionados'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl shadow-sm hover:shadow-md transition-all"
                onClick={handleBulkMarkAsRead}
                disabled={isBulkUpdating}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Marcar como leído
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl shadow-sm hover:shadow-md transition-all"
                onClick={handleBulkArchive}
                disabled={isBulkUpdating}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Archivar
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && leads.length === 0 && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && leads.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-shadow duration-300 p-4 sm:p-6 md:p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-inner">
              <Inbox className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron leads
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {Object.keys(filters).length > 0
                ? 'Intenta ajustar los filtros'
                : 'Los leads de inquilinos interesados aparecerán aquí'}
            </p>
            {Object.keys(filters).length > 0 && (
              <Button variant="outline" className="rounded-xl shadow-lg hover:shadow-xl transition-all" onClick={handleResetFilters}>
                Limpiar Filtros
              </Button>
            )}
          </div>
        )}

        {/* Leads Grid */}
        {!isLoading && leads.length > 0 && (
          <div className="space-y-4">
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                isSelected={selectedLeads.has(lead.id)}
                onSelect={handleSelectLead}
                onView={setDetailLeadId}
                onWhatsApp={handleWhatsApp}
                onEmail={handleEmail}
                onMarkAsRead={markAsRead}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && leads.length > 0 && (
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              className="rounded-xl shadow-sm hover:shadow-md transition-all"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page}
            </span>
            <Button
              variant="outline"
              className="rounded-xl shadow-sm hover:shadow-md transition-all"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore || isLoading}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      <LeadDetailPanel
        leadId={detailLeadId}
        open={detailLeadId !== null}
        onClose={() => setDetailLeadId(null)}
        onWhatsApp={handleWhatsApp}
        onEmail={handleEmail}
        onStatusChange={(leadId, status) => {
          updateStatus({ leadId, status });
        }}
      />

      {/* Response Modal */}
      <ResponseModal
        open={responseLeadId !== null}
        onClose={() => setResponseLeadId(null)}
        lead={responseLead}
        onSend={handleSendResponse}
      />
    </div>
  );
}
