/**
 * Response Modal Component
 * Modal for responding to leads with template support
 */

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mail, Phone, Send, Loader2, FileText } from 'lucide-react';
import { useResponseTemplates, TemplateCategory } from '@/hooks/landlord/useResponseTemplates';
import { Lead } from '../LeadsTab/LeadCard';
import { toast } from 'sonner';

interface ResponseModalProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSend: (method: 'whatsapp' | 'email' | 'phone', message: string, templateId?: string) => Promise<void>;
}

export function ResponseModal({ open, onClose, lead, onSend }: ResponseModalProps) {
  const [method, setMethod] = React.useState<'whatsapp' | 'email' | 'phone'>('whatsapp');
  const [message, setMessage] = React.useState('');
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | undefined>();
  const [isSending, setIsSending] = React.useState(false);

  const { templates, isLoading: loadingTemplates } = useResponseTemplates();

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setMethod('whatsapp');
      setMessage('');
      setSelectedTemplateId(undefined);
    }
  }, [open]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      // Replace variables in template
      let content = template.content;

      // Basic variable replacement (can be enhanced)
      if (lead) {
        const tenantName = lead.tenant?.fullName || lead.tenantSnapshot?.fullName || 'el inquilino';
        const propertyAddress = lead.property?.address?.neighborhood || 'la propiedad';
        const propertyPrice = lead.property?.priceAmount || 0;

        content = content
          .replace(/\{\{tenant_name\}\}/g, tenantName)
          .replace(/\{\{property_address\}\}/g, propertyAddress)
          .replace(/\{\{property_price\}\}/g, propertyPrice.toLocaleString());
      }

      setMessage(content);
      setSelectedTemplateId(templateId);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Por favor escribe un mensaje');
      return;
    }

    if (!lead) return;

    setIsSending(true);
    try {
      await onSend(method, message, selectedTemplateId);
      onClose();
      toast.success('Respuesta enviada exitosamente');
    } catch (error) {
      toast.error('Error al enviar respuesta');
    } finally {
      setIsSending(false);
    }
  };

  const methodConfig = {
    whatsapp: {
      label: 'WhatsApp',
      icon: MessageSquare,
      color: 'bg-green-600 hover:bg-green-700',
    },
    email: {
      label: 'Email',
      icon: Mail,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    phone: {
      label: 'Teléfono',
      icon: Phone,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  };

  if (!lead) return null;

  const tenantName = lead.tenant?.fullName || lead.tenantSnapshot?.fullName || 'Inquilino';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Responder a {tenantName}</DialogTitle>
          <DialogDescription>
            Elige el método de contacto y escribe tu mensaje
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Method Selector */}
          <div className="space-y-2">
            <Label>Método de Contacto</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['whatsapp', 'email', 'phone'] as const).map((m) => {
                const config = methodConfig[m];
                const Icon = config.icon;
                const isSelected = method === m;

                return (
                  <Button
                    key={m}
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => setMethod(m)}
                    className={isSelected ? config.color : ''}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {config.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Template Selector */}
          <div className="space-y-2">
            <Label>Plantilla (Opcional)</Label>
            {loadingTemplates ? (
              <div className="text-sm text-muted-foreground">Cargando plantillas...</div>
            ) : templates.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No hay plantillas guardadas. Escribe tu mensaje directamente.
              </div>
            ) : (
              <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una plantilla..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Sin plantilla
                    </div>
                  </SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                        {template.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Message Composer */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              placeholder="Escribe tu mensaje aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              {message.length} caracteres
            </div>
          </div>

          {/* Variables Helper */}
          {selectedTemplateId && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
              <p className="text-xs font-medium text-blue-900 mb-1">Variables Disponibles:</p>
              <p className="text-xs text-blue-700">
                {'{{tenant_name}}, {{property_address}}, {{property_price}}'}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={isSending || !message.trim()}>
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
