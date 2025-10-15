/**
 * Lead Card Component
 * Individual lead card in the leads list - Polished Modern Design
 */

import * as React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MessageSquare,
  Mail,
  MapPin,
  Home,
  Bed,
  Bath,
  Car,
  CheckCircle2,
  Shield,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Lead {
  id: string;
  tenantId: string;
  landlordId: string;
  propertyId: string;
  status: 'new' | 'contacted' | 'archived';
  source: 'direct' | 'marketplace' | 'search' | 'referral';
  urgency: 'immediate' | 'planned' | 'flexible';
  unreadCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
  relevanceScore?: number;
  firstViewedAt?: string;
  respondedAt?: string;
  responseTimeMinutes?: number;
  contactPhone?: string;
  contactEmail?: string;
  inquiryMessage?: string;
  tenantSnapshot: any;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  tenant?: any;
  property?: any;
}

interface LeadCardProps {
  lead: Lead;
  isSelected?: boolean;
  onSelect?: (leadId: string, selected: boolean) => void;
  onView?: (leadId: string) => void;
  onWhatsApp?: (leadId: string) => void;
  onEmail?: (leadId: string) => void;
  onMarkAsRead?: (leadId: string) => void;
  onStatusChange?: (leadId: string, status: Lead['status']) => void;
  onExpandChange?: (leadId: string, isExpanded: boolean) => void;
}

export function LeadCard({
  lead,
  isSelected = false,
  onSelect,
  onView,
  onWhatsApp,
  onEmail,
  onMarkAsRead,
  onStatusChange,
  onExpandChange,
}: LeadCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleToggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    onExpandChange?.(lead.id, newExpandedState);
  };

  const tenantName = lead.tenant?.fullName || lead.tenantSnapshot?.fullName || 'Inquilino';
  const propertyAddress = lead.property?.address?.neighborhood || 'Propiedad';
  const propertyPrice = lead.property?.priceAmount || 0;
  const propertyTitle = lead.property?.title || 'Propiedad';

  // Tenant info (prioritize snapshot, then tenant profile)
  const tenantBudgetMin = lead.tenantSnapshot?.budgetMin || lead.tenant?.budgetMin || 0;
  const tenantBudgetMax = lead.tenantSnapshot?.budgetMax || lead.tenant?.budgetMax || 0;
  const tenantHasPets = lead.tenantSnapshot?.hasPets || lead.tenant?.hasPets || false;
  const tenantPetDetails = lead.tenantSnapshot?.petDetails || lead.tenant?.petDetails || null;
  const tenantMoveDate = lead.tenantSnapshot?.moveDate || lead.tenant?.moveDate || null;
  const tenantIsVerified = lead.tenantSnapshot?.isVerified || lead.tenant?.isVerified || false;
  const tenantPhone = lead.contactPhone || lead.tenantSnapshot?.phone || lead.tenant?.phone;

  // Search preferences
  const desiredBedrooms = lead.tenantSnapshot?.desiredBedrooms || lead.tenant?.desiredBedrooms || [];
  const desiredBathrooms = lead.tenantSnapshot?.desiredBathrooms || lead.tenant?.desiredBathrooms || [];
  const desiredParkingSpaces = lead.tenantSnapshot?.desiredParkingSpaces || lead.tenant?.desiredParkingSpaces || [];
  const propertyTypes = lead.tenantSnapshot?.propertyTypes || lead.tenant?.propertyTypes || [];
  const preferredAreas = lead.tenantSnapshot?.preferredAreas || lead.tenant?.preferredAreas || [];

  // Budget compatibility
  const isBudgetCompatible = propertyPrice >= tenantBudgetMin && propertyPrice <= tenantBudgetMax;

  // Urgency mapping
  const urgencyMap: Record<string, string> = {
    immediate: 'Menos de 1 mes',
    planned: '1-3 meses',
    flexible: 'Más de 3 meses',
  };

  const timeAgo = formatDistanceToNow(new Date(lead.createdAt), {
    addSuffix: true,
    locale: es,
  });

  // Property type translation
  const propertyTypeMap: Record<string, string> = {
    apartment: 'Apartamento',
    house: 'Casa',
    room: 'Habitación',
  };

  return (
    <Card
      className={cn(
        'rounded-2xl border border-gray-200 shadow-lg shadow-blue-100/30 hover:shadow-xl hover:shadow-blue-200/40 transition-all duration-300',
        isSelected && 'ring-2 ring-blue-500',
        lead.unreadCount > 0 && 'border-l-4 border-l-blue-600'
      )}
    >
      <CardHeader
        className="p-5 cursor-pointer relative"
        onClick={handleToggleExpand}
      >
        {/* Selection Checkbox - Top Right */}
        {onSelect && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => {
              onSelect(lead.id, checked as boolean);
            }}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-5 right-5"
          />
        )}

        <div className="flex items-start gap-3 pr-8">
          {/* Tenant Avatar */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={lead.tenant?.avatar} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-base">
              {tenantName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)}
            </AvatarFallback>
          </Avatar>

          {/* Lead Info */}
          <div className="flex-1 min-w-0">
            {/* Name and Time */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {tenantName}
                </h3>
                {lead.unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 px-2 text-xs flex-shrink-0">
                    {lead.unreadCount}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">{timeAgo}</span>
            </div>

            {/* Budget Value */}
            <div className="text-sm font-semibold text-gray-900 mb-2">
              L.{tenantBudgetMin.toLocaleString()} - L.{tenantBudgetMax.toLocaleString()}
            </div>

            {/* Property Title */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2.5">
              <Home className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{propertyTitle}</span>
            </div>

            {/* Status Badges - Only show important ones */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap gap-2">
                {lead.status === 'new' && (
                  <Badge className="bg-blue-50 text-blue-700 border-0 text-xs px-2.5 py-1 font-medium">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Nuevo
                  </Badge>
                )}
                {isBudgetCompatible && (
                  <Badge className="bg-emerald-50 text-emerald-700 border-0 text-xs px-2.5 py-1 font-medium">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Presupuesto compatible
                  </Badge>
                )}
                {tenantIsVerified && (
                  <Badge className="bg-blue-50 text-blue-700 border-0 text-xs px-2.5 py-1 font-medium">
                    <Shield className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                )}
                {tenantMoveDate && (
                  <Badge className="bg-blue-50 text-blue-700 border-0 text-xs px-2.5 py-1 font-medium">
                    {urgencyMap[lead.urgency] || tenantMoveDate}
                  </Badge>
                )}
              </div>

              {/* Expand/Collapse Indicator */}
              <div className="flex-shrink-0 ml-2">
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Status Management Actions */}
            {(lead.status === 'new' || lead.status === 'contacted') && (
              <div className="flex items-center gap-3 mt-4">
                {lead.status === 'new' && (
                  <Button
                    size="sm"
                    className="rounded-xl shadow-sm hover:shadow-md transition-all duration-200 h-9 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange?.(lead.id, 'contacted');
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Marcar como Contactado
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl shadow-sm hover:shadow-md hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200 h-9 border-gray-300 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange?.(lead.id, 'archived');
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Archivar
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Expandable Content */}
      {isExpanded && (
        <CardContent className="p-5 pt-4 space-y-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
          {/* Contact Information - PRIORITY */}
          <div>
            <div className="text-xs font-medium text-gray-900 uppercase tracking-wide mb-2">
              Información de Contacto
            </div>
            <div className="space-y-2">
              {tenantPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <a
                    href={`https://wa.me/${tenantPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {tenantPhone}
                  </a>
                </div>
              )}
              {lead.contactEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <a
                    href={`mailto:${lead.contactEmail}`}
                    className="text-gray-600 hover:text-gray-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {lead.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Budget Section */}
        <div>
          <div className="text-xs font-medium text-gray-900 uppercase tracking-wide mb-2">
            Presupuesto
          </div>
          <div className="text-sm text-gray-600">
            L.{tenantBudgetMin.toLocaleString()} - L.{tenantBudgetMax.toLocaleString()}
          </div>
        </div>

        {/* Search Preferences */}
        {(propertyTypes.length > 0 || desiredBedrooms.length > 0 || desiredBathrooms.length > 0 || desiredParkingSpaces.length > 0) && (
          <div>
            <div className="text-xs font-medium text-gray-900 uppercase tracking-wide mb-2">
              Busca
            </div>
            <div className="space-y-2">
              {/* Property Types */}
              {propertyTypes.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Home className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex gap-1.5 flex-wrap">
                    {propertyTypes.map((type: string) => (
                      <span key={type} className="text-gray-600">
                        {propertyTypeMap[type] || type}
                      </span>
                    )).reduce((prev: any, curr: any) => [prev, <span key={Math.random()} className="text-gray-400">, </span>, curr])}
                  </div>
                </div>
              )}

              {/* Bedrooms, Bathrooms, Parking */}
              <div className="flex items-center gap-4 text-sm flex-wrap">
                {desiredBedrooms.length > 0 && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Bed className="h-4 w-4 text-gray-400" />
                    <span>{desiredBedrooms.sort((a: number, b: number) => a - b).map((n: number) => n === 5 ? '5+' : n).join(', ')} hab</span>
                  </div>
                )}
                {desiredBathrooms.length > 0 && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Bath className="h-4 w-4 text-gray-400" />
                    <span>{desiredBathrooms.sort((a: number, b: number) => a - b).map((n: number) => n === 4 ? '4+' : n).join(', ')} baños</span>
                  </div>
                )}
                {desiredParkingSpaces.length > 0 && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Car className="h-4 w-4 text-gray-400" />
                    <span>{desiredParkingSpaces.sort((a: number, b: number) => a - b).map((n: number) => n === 3 ? '3+' : n).join(', ')} parqueo{desiredParkingSpaces.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preferred Areas */}
        {preferredAreas.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-900 uppercase tracking-wide mb-2">
              Zonas preferidas
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600 flex-1">
                {preferredAreas.slice(0, 3).join(', ')}
                {preferredAreas.length > 3 && <span className="text-gray-500"> (+{preferredAreas.length - 3} más)</span>}
              </span>
            </div>
          </div>
        )}

        {/* Pets */}
        {tenantHasPets && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-base">🐕</span>
            <span>{tenantPetDetails || 'Tiene mascotas'}</span>
          </div>
        )}

        {/* Property Price Comparison - Highlighted */}
        <div
          className={cn(
            'flex items-center justify-between p-4 rounded-xl border transition-colors',
            isBudgetCompatible
              ? 'bg-emerald-50/50 border-emerald-200'
              : 'bg-orange-50/50 border-orange-200'
          )}
        >
          <div>
            <div className="text-xs text-gray-600 mb-1">Tu propiedad</div>
            <div className="text-lg font-bold text-gray-900">
              L.{propertyPrice.toLocaleString()}
              <span className="text-sm font-normal text-gray-500">/mes</span>
            </div>
          </div>
          {isBudgetCompatible ? (
            <div className="flex items-center gap-1.5 text-emerald-700 text-sm font-medium">
              <CheckCircle2 className="h-5 w-5" />
              Compatible
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-orange-700 text-sm font-medium">
              <AlertCircle className="h-5 w-5" />
              Fuera de rango
            </div>
          )}
        </div>

        {/* Inquiry Message Preview */}
        {lead.inquiryMessage && (
          <div className="border-t border-gray-100 pt-4">
            <div className="text-xs font-medium text-gray-900 uppercase tracking-wide mb-2">
              Mensaje inicial
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 italic">
              "{lead.inquiryMessage}"
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-3 border-t border-gray-100">
          {/* Contact Actions */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className={cn(
                "flex-1 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 h-10 text-white",
                "bg-[#25D366] hover:bg-[#20BA5A] active:bg-[#1DA851]",
                "disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (tenantPhone) {
                  const cleanPhone = tenantPhone.replace(/[^0-9]/g, '');
                  window.open(`https://wa.me/${cleanPhone}`, '_blank');
                }
              }}
              disabled={!tenantPhone}
            >
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Abrir WhatsApp
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 h-10 border-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                onEmail?.(lead.id);
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>
        </div>
        </CardContent>
      )}
    </Card>
  );
}
