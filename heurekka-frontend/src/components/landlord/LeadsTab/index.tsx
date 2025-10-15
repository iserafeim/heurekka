/**
 * Leads Tab Component
 * Main container for lead management
 */

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Inbox, RefreshCcw, Trash2, CheckCircle2, AlertCircle, Clock, Sparkles } from 'lucide-react';
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

  // Initialize viewedUrgentLeads from localStorage
  const [viewedUrgentLeads, setViewedUrgentLeads] = React.useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('viewedUrgentLeads');
      if (stored) {
        try {
          return new Set(JSON.parse(stored));
        } catch {
          return new Set();
        }
      }
    }
    return new Set();
  });

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

  // Persist viewedUrgentLeads to localStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('viewedUrgentLeads', JSON.stringify(Array.from(viewedUrgentLeads)));
    }
  }, [viewedUrgentLeads]);

  // Extract unique properties from leads for the property filter
  const uniqueProperties = React.useMemo(() => {
    const propertyMap = new Map<string, { id: string; title: string }>();

    leads.forEach((lead) => {
      if (lead.property && lead.property.id && lead.property.title) {
        propertyMap.set(lead.property.id, {
          id: lead.property.id,
          title: lead.property.title,
        });
      }
    });

    return Array.from(propertyMap.values());
  }, [leads]);

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

  const handleLeadExpand = (leadId: string, isExpanded: boolean) => {
    if (isExpanded) {
      // Check if this lead is an urgent lead
      const lead = leads.find(l => l.id === leadId);
      if (lead && lead.status === 'new' && lead.urgency === 'immediate') {
        // Check budget compatibility
        const propertyPrice = lead.property?.priceAmount || 0;
        const budgetMin = lead.tenantSnapshot?.budgetMin || lead.tenant?.budgetMin || 0;
        const budgetMax = lead.tenantSnapshot?.budgetMax || lead.tenant?.budgetMax || 0;
        const isBudgetCompatible = propertyPrice >= budgetMin && propertyPrice <= budgetMax;

        if (isBudgetCompatible) {
          // Mark this urgent lead as viewed
          setViewedUrgentLeads(prev => new Set([...prev, leadId]));
        }
      }
    }
  };

  // Calculate urgent leads (immediate urgency + new status + budget compatible)
  const urgentLeads = leads.filter(lead => {
    if (lead.status !== 'new') return false;
    if (lead.urgency !== 'immediate') return false;
    if (viewedUrgentLeads.has(lead.id)) return false; // Exclude already viewed leads

    // Check budget compatibility (prioritize snapshot)
    const propertyPrice = lead.property?.priceAmount || 0;
    const budgetMin = lead.tenantSnapshot?.budgetMin || lead.tenant?.budgetMin || 0;
    const budgetMax = lead.tenantSnapshot?.budgetMax || lead.tenant?.budgetMax || 0;
    const isBudgetCompatible = propertyPrice >= budgetMin && propertyPrice <= budgetMax;

    return isBudgetCompatible;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">Gestiona tus contactos e inquilinos potenciales</p>
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

      {/* Filters Bar */}
      <LeadFilters
        filters={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
        onReset={handleResetFilters}
        properties={uniqueProperties}
      />

      {/* Leads Content */}
      <div className="space-y-4">
        {/* Total Opportunity Value Card */}
        {!isLoading && leads.length > 0 && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2.5 rounded-xl flex-shrink-0">
                <svg className="h-6 w-6 text-emerald-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-emerald-900 mb-0.5">
                  Valor Total de Oportunidades
                </h3>
                <p className="text-2xl font-bold text-emerald-700">
                  L.{leads.reduce((sum, lead) => {
                    // Sum the average budget from each tenant (midpoint of their budget range)
                    const budgetMin = lead.tenantSnapshot?.budgetMin || lead.tenant?.budgetMin || 0;
                    const budgetMax = lead.tenantSnapshot?.budgetMax || lead.tenant?.budgetMax || 0;
                    const averageBudget = (budgetMin + budgetMax) / 2;
                    return sum + averageBudget;
                  }, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Urgent Leads Alert */}
        {urgentLeads.length > 0 && !filters.status && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-lg shadow-blue-100/40 hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-2.5 rounded-xl flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-lg font-bold text-blue-900">
                    Atención Inmediata
                  </h3>
                  <Badge className="bg-blue-600 text-white border-0 px-2.5 py-0.5 text-sm font-semibold">
                    {urgentLeads.length}
                  </Badge>
                </div>
                <p className="text-sm text-blue-800 mb-3 leading-relaxed">
                  {urgentLeads.length === 1
                    ? 'Tienes 1 lead urgente con mudanza inmediata y presupuesto compatible'
                    : `Tienes ${urgentLeads.length} leads urgentes con mudanza inmediata y presupuesto compatible`}
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-sm text-blue-700 font-medium">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>Mudanza: menos de 1 mes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-blue-700 font-medium">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <span>Presupuesto compatible</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-blue-700 font-medium">
                    <Sparkles className="h-4 w-4 flex-shrink-0" />
                    <span>Nuevos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Opportunities Header */}
        {!isLoading && leads.length > 0 && (
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Oportunidades</h2>
            <span className="text-sm text-gray-500">
              {totalCount} {totalCount === 1 ? 'oportunidad' : 'oportunidades'}
            </span>
          </div>
        )}

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
                onStatusChange={(leadId, status) => {
                  updateStatus({ leadId, status });
                }}
                onExpandChange={handleLeadExpand}
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
