/**
 * Lead Card Component
 * Individual lead card in the leads list
 */

import * as React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Lead {
  id: string;
  tenantId: string;
  landlordId: string;
  propertyId: string;
  status: 'new' | 'viewed' | 'contacted' | 'scheduled' | 'completed' | 'rejected' | 'expired';
  priority: 'high' | 'medium' | 'low';
  quality: 'high' | 'medium' | 'low';
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
}

export function LeadCard({
  lead,
  isSelected = false,
  onSelect,
  onView,
  onWhatsApp,
  onEmail,
  onMarkAsRead,
}: LeadCardProps) {
  const tenantName = lead.tenant?.fullName || lead.tenantSnapshot?.fullName || 'Inquilino';
  const propertyAddress = lead.property?.address?.neighborhood || 'Propiedad';
  const propertyPrice = lead.property?.priceAmount || 0;

  // Status badges
  const statusConfig = {
    new: { label: 'Nuevo', color: 'bg-green-100 text-green-800 border-green-200' },
    viewed: { label: 'Visto', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    contacted: { label: 'Contactado', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    scheduled: { label: 'Agendado', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    completed: { label: 'Completado', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-800 border-red-200' },
    expired: { label: 'Expirado', color: 'bg-gray-100 text-gray-500 border-gray-200' },
  };

  const priorityConfig = {
    high: { label: 'Alta', color: 'bg-red-100 text-red-800 border-red-200' },
    medium: { label: 'Media', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    low: { label: 'Baja', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  };

  const qualityConfig = {
    high: { label: 'Alta', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    medium: { label: 'Media', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    low: { label: 'Baja', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  const timeAgo = formatDistanceToNow(new Date(lead.createdAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <Card
      className={cn(
        'rounded-2xl border border-gray-200 shadow-lg shadow-blue-100/30 hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-300 cursor-pointer',
        isSelected && 'ring-2 ring-blue-500',
        lead.unreadCount > 0 && 'border-l-4 border-l-blue-600'
      )}
      onClick={() => onView?.(lead.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Selection Checkbox */}
          {onSelect && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => {
                onSelect(lead.id, checked as boolean);
              }}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
          )}

          {/* Tenant Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarImage src={lead.tenant?.avatar} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
              {tenantName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)}
            </AvatarFallback>
          </Avatar>

          {/* Lead Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base font-semibold truncate">
                {tenantName}
              </CardTitle>
              {lead.unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                  {lead.unreadCount}
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {propertyAddress}
              </span>
            </CardDescription>
          </div>

          {/* Time */}
          <div className="text-xs text-muted-foreground">{timeAgo}</div>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="outline" className={cn('text-xs', statusConfig[lead.status].color)}>
            {statusConfig[lead.status].label}
          </Badge>
          <Badge variant="outline" className={cn('text-xs', priorityConfig[lead.priority].color)}>
            Prioridad: {priorityConfig[lead.priority].label}
          </Badge>
          <Badge variant="outline" className={cn('text-xs', qualityConfig[lead.quality].color)}>
            Calidad: {qualityConfig[lead.quality].label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Inquiry Message Preview */}
        {lead.inquiryMessage && (
          <p className="text-sm text-gray-700 line-clamp-2 mb-3">
            {lead.inquiryMessage}
          </p>
        )}

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            L.{propertyPrice.toLocaleString()}/mes
          </span>
          {lead.tenant?.moveDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {lead.tenant.moveDate}
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs rounded-xl shadow-sm hover:shadow-md transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onWhatsApp?.(lead.id);
            }}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            WhatsApp
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs rounded-xl shadow-sm hover:shadow-md transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onEmail?.(lead.id);
            }}
          >
            <Mail className="h-3.5 w-3.5 mr-1" />
            Email
          </Button>
          {lead.unreadCount > 0 && onMarkAsRead && (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl hover:bg-blue-50 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(lead.id);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
