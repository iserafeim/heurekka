/**
 * Lead Card Component
 * Individual lead card in the leads list - Polished Modern Design
 */

import * as React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Card,
  CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeadDetailModal } from './LeadDetailModal';

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
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
    <>
      <Card
        className={cn(
          'rounded-2xl border border-gray-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer',
          isSelected && 'ring-2 ring-blue-500'
        )}
        onClick={handleOpenModal}
      >
        <CardHeader className="px-4 pt-0 pb-0 sm:px-5 sm:pt-0 sm:pb-0 relative">
        {/* Mobile Layout */}
        <div className="sm:hidden space-y-3">
          {/* Header: Avatar + Name + Status Badge */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={lead.tenant?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold text-xs">
                    {tenantName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {tenantName}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  L.{tenantBudgetMin.toLocaleString()} - L.{tenantBudgetMax.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Tags/Badges Row */}
          <div className="flex flex-wrap gap-1.5">
            {lead.status === 'new' && (
              <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px] px-2 py-0.5 font-medium rounded-full">
                Nuevo
              </Badge>
            )}
            {isBudgetCompatible && (
              <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px] px-2 py-0.5 font-medium rounded-full">
                Presupuesto compatible
              </Badge>
            )}
            {tenantIsVerified && (
              <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px] px-2 py-0.5 font-medium rounded-full">
                Verificado
              </Badge>
            )}
            {tenantMoveDate && (
              <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px] px-2 py-0.5 font-medium rounded-full">
                {urgencyMap[lead.urgency]}
              </Badge>
            )}
          </div>

          {/* Info Grid */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Propiedad</p>
            <p className="text-sm font-medium text-gray-900 line-clamp-2">{propertyTitle}</p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500 font-medium">Quick Actions</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-8 px-4 text-xs font-medium border-gray-300 hover:bg-gray-50 relative shadow-none text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  if (tenantPhone) {
                    const cleanPhone = tenantPhone.replace(/[^0-9]/g, '');
                    window.open(`https://wa.me/${cleanPhone}`, '_blank');
                  }
                }}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-gray-600" />
                Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:block">
          <div className="space-y-3">
            {/* Header: Avatar + Name + Status Badge */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={lead.tenant?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold text-sm">
                      {tenantName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {tenantName}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    L.{tenantBudgetMin.toLocaleString()} - L.{tenantBudgetMax.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm text-gray-500">{timeAgo}</span>
              </div>
            </div>

            {/* Tags/Badges Row */}
            <div className="flex flex-wrap gap-1.5">
              {lead.status === 'new' && (
                <Badge className="bg-blue-100 text-blue-700 border-0 text-xs px-2.5 py-0.5 font-medium rounded-full">
                  Nuevo
                </Badge>
              )}
              {isBudgetCompatible && (
                <Badge className="bg-blue-100 text-blue-700 border-0 text-xs px-2.5 py-0.5 font-medium rounded-full">
                  Presupuesto compatible
                </Badge>
              )}
              {tenantIsVerified && (
                <Badge className="bg-blue-100 text-blue-700 border-0 text-xs px-2.5 py-0.5 font-medium rounded-full">
                  Verificado
                </Badge>
              )}
              {tenantMoveDate && (
                <Badge className="bg-blue-100 text-blue-700 border-0 text-xs px-2.5 py-0.5 font-medium rounded-full">
                  {urgencyMap[lead.urgency]}
                </Badge>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Propiedad</p>
                <p className="text-sm font-medium text-gray-900 line-clamp-2">{propertyTitle}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Ubicación</p>
                <p className="text-sm font-medium text-gray-900">{propertyAddress}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Precio Propiedad</p>
                <p className="text-sm font-medium text-gray-900">L.{propertyPrice.toLocaleString()}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-3">
              <span className="text-xs text-gray-500 font-medium">Quick Actions</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-8 px-4 text-xs font-medium border-gray-300 hover:bg-gray-50 relative shadow-none text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (tenantPhone) {
                      const cleanPhone = tenantPhone.replace(/[^0-9]/g, '');
                      window.open(`https://wa.me/${cleanPhone}`, '_blank');
                    }
                  }}
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-gray-600" />
                  Chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>

    <LeadDetailModal
      lead={lead}
      open={isModalOpen}
      onClose={handleCloseModal}
      onWhatsApp={onWhatsApp}
      onEmail={onEmail}
    />
    </>
  );
}
