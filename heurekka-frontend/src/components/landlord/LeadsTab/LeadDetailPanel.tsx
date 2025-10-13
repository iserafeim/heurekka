/**
 * Lead Detail Panel Component
 * Slide-in panel showing full lead details
 */

import * as React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  Home,
  User,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Lead } from './LeadCard';
import { useLandlordLead } from '@/hooks/landlord/useLandlordLeads';

interface LeadDetailPanelProps {
  leadId: string | null;
  open: boolean;
  onClose: () => void;
  onWhatsApp?: (leadId: string) => void;
  onEmail?: (leadId: string) => void;
  onStatusChange?: (leadId: string, status: Lead['status']) => void;
}

export function LeadDetailPanel({
  leadId,
  open,
  onClose,
  onWhatsApp,
  onEmail,
  onStatusChange,
}: LeadDetailPanelProps) {
  const { lead, isLoading } = useLandlordLead(leadId);

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {isLoading || !lead ? (
          <LeadDetailSkeleton />
        ) : (
          <LeadDetailContent
            lead={lead}
            onClose={onClose}
            onWhatsApp={onWhatsApp}
            onEmail={onEmail}
            onStatusChange={onStatusChange}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function LeadDetailContent({
  lead,
  onClose,
  onWhatsApp,
  onEmail,
  onStatusChange,
}: {
  lead: Lead;
  onClose: () => void;
  onWhatsApp?: (leadId: string) => void;
  onEmail?: (leadId: string) => void;
  onStatusChange?: (leadId: string, status: Lead['status']) => void;
}) {
  const tenantName = lead.tenant?.fullName || lead.tenantSnapshot?.fullName || 'Inquilino';
  const propertyAddress = lead.property?.address?.neighborhood || 'Propiedad';
  const propertyPrice = lead.property?.priceAmount || 0;

  const statusConfig = {
    new: { label: 'Nuevo', color: 'bg-green-100 text-green-800 border-green-200' },
    viewed: { label: 'Visto', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    contacted: { label: 'Contactado', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    scheduled: { label: 'Agendado', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    completed: { label: 'Completado', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-800 border-red-200' },
    expired: { label: 'Expirado', color: 'bg-gray-100 text-gray-500 border-gray-200' },
  };

  return (
    <>
      <SheetHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={lead.tenant?.avatar} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-xl">
              {tenantName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-xl">{tenantName}</SheetTitle>
            <SheetDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {propertyAddress}
            </SheetDescription>
          </div>
        </div>

        {/* Status and Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline" className={cn('text-xs', statusConfig[lead.status].color)}>
            {statusConfig[lead.status].label}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Prioridad: {lead.priority === 'high' ? 'Alta' : lead.priority === 'medium' ? 'Media' : 'Baja'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Calidad: {lead.quality === 'high' ? 'Alta' : lead.quality === 'medium' ? 'Media' : 'Baja'}
          </Badge>
        </div>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onWhatsApp?.(lead.id)}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button onClick={() => onEmail?.(lead.id)} variant="outline" className="flex-1">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>

        {/* Status Change */}
        {onStatusChange && (
          <div>
            <label className="text-sm font-medium mb-2 block">Cambiar Estado</label>
            <Select value={lead.status} onValueChange={(value) => onStatusChange(lead.id, value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Nuevo</SelectItem>
                <SelectItem value="viewed">Visto</SelectItem>
                <SelectItem value="contacted">Contactado</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator />

        {/* Inquiry Message */}
        {lead.inquiryMessage && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Mensaje de Consulta</h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {lead.inquiryMessage}
            </p>
          </div>
        )}

        {/* Contact Information */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Información de Contacto</h3>
          <div className="space-y-2">
            {lead.contactPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{lead.contactPhone}</span>
              </div>
            )}
            {lead.contactEmail && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{lead.contactEmail}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Property Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Detalles de la Propiedad</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Precio Mensual
              </span>
              <span className="font-semibold">L.{propertyPrice.toLocaleString()}</span>
            </div>
            {lead.property?.bedrooms && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Habitaciones
                </span>
                <span>{lead.property.bedrooms}</span>
              </div>
            )}
            {lead.property?.bathrooms && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Baños</span>
                <span>{lead.property.bathrooms}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Tenant Profile */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Perfil del Inquilino</h3>
          <div className="space-y-2">
            {lead.tenant?.budgetMax && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Presupuesto</span>
                <span>L.{lead.tenant.budgetMax.toLocaleString()}</span>
              </div>
            )}
            {lead.tenant?.moveDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de Mudanza
                </span>
                <span>{lead.tenant.moveDate}</span>
              </div>
            )}
            {lead.tenant?.desiredBedrooms && lead.tenant.desiredBedrooms.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Habitaciones Deseadas</span>
                <span>{lead.tenant.desiredBedrooms.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Metadata */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Información Adicional</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Creado</span>
              <span>{format(new Date(lead.createdAt), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}</span>
            </div>
            {lead.firstViewedAt && (
              <div className="flex items-center justify-between">
                <span>Primera Visualización</span>
                <span>{format(new Date(lead.firstViewedAt), "d 'de' MMMM, HH:mm", { locale: es })}</span>
              </div>
            )}
            {lead.respondedAt && (
              <div className="flex items-center justify-between">
                <span>Respondido</span>
                <span>{format(new Date(lead.respondedAt), "d 'de' MMMM, HH:mm", { locale: es })}</span>
              </div>
            )}
            {lead.responseTimeMinutes !== undefined && (
              <div className="flex items-center justify-between">
                <span>Tiempo de Respuesta</span>
                <span>{lead.responseTimeMinutes} minutos</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function LeadDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-22" />
      </div>
      <Separator />
      <div className="space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Separator />
      <div className="space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
