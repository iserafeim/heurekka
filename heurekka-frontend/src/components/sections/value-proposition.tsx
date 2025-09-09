'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowUp, CalendarCheck, Globe, Play, Plus, Search, MessageCircle, Target, Signature, UserCheck } from 'lucide-react'

export function ValueProposition() {
    return (
        <section>
            <div className="py-24">
                <div className="mx-auto w-full max-w-5xl px-6">
                    <div>
                        <h2 className="text-foreground max-w-2xl text-balance text-4xl font-semibold">Encuentra tu hogar ideal en 3 pasos</h2>
                    </div>
                    <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card
                            variant="soft"
                            className="overflow-hidden p-6">
                            <Search className="text-blue-600 size-5" />
                            <h3 className="text-foreground mt-5 text-lg font-semibold">Busca con Inteligencia</h3>
                            <p className="text-muted-foreground mt-3 text-balance">Encuentra propiedades con filtros avanzados y búsqueda inteligente.</p>

                            <PropertySearchIllustration />
                        </Card>

                        <Card
                            variant="soft"
                            className="group overflow-hidden px-6 pt-6">
                            <UserCheck className="text-blue-600 size-5" />
                            <h3 className="text-foreground mt-5 text-lg font-semibold">Crea Tu Perfil Único</h3>
                            <p className="text-muted-foreground mt-3 text-balance">Crea tu perfil único y compártelo automáticamente con propietarios.</p>

                            <ProfileCreationIllustration />
                        </Card>
                        
                        <Card
                            variant="soft"
                            className="group overflow-hidden px-6 pt-6">
                            <MessageCircle className="text-blue-600 size-5" />
                            <h3 className="text-foreground mt-5 text-lg font-semibold">Conecta Directamente</h3>
                            <p className="text-muted-foreground mt-3 text-balance">Conecta directamente por WhatsApp sin intermediarios ni comisiones.</p>

                            <div className="mask-b-from-50 -mx-2 -mt-2 px-2 pt-2">
                                <WhatsAppConnectionIllustration />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}

const PropertySearchIllustration = () => {
    return (
        <div
            aria-hidden
            className="mask-b-from-50 -mx-2 -mt-2 px-2 pt-2">
            <Card className="aspect-video translate-y-4 p-4 transition-transform duration-200 group-hover:translate-y-0">
                <div className="mb-0.5 text-sm font-semibold">Búsqueda de Propiedades</div>
                <div className="mb-4 flex gap-2 text-sm">
                    <span className="text-muted-foreground">Tegucigalpa • 8 min</span>
                </div>
                <div className="mb-2 flex -space-x-1.5">
                    <div className="flex -space-x-1.5">
                        <div className="bg-background size-7 rounded-full border p-0.5 shadow shadow-zinc-950/5 flex items-center justify-center">
                            🏠
                        </div>
                        <div className="bg-background size-7 rounded-full border p-0.5 shadow shadow-zinc-950/5 flex items-center justify-center">
                            🏢
                        </div>
                        <div className="bg-background size-7 rounded-full border p-0.5 shadow shadow-zinc-950/5 flex items-center justify-center">
                            🏡
                        </div>
                    </div>
                </div>
                <div className="text-muted-foreground text-sm font-medium">42 propiedades encontradas</div>
            </Card>
        </div>
    )
}

const ProfileCreationIllustration = () => {
    return (
        <div
            aria-hidden
            className="relative mt-6">
            <Card className="aspect-video w-4/5 translate-y-4 p-3 transition-transform duration-200 ease-in-out group-hover:-rotate-3">
                <div className="mb-3 flex items-center gap-2">
                    <div className="bg-blue-50 size-6 rounded border p-0.5 shadow shadow-zinc-950/5 flex items-center justify-center">
                        📋
                    </div>
                    <span className="text-muted-foreground text-sm font-medium">Mi Perfil</span>
                    <span className="text-muted-foreground/75 text-xs">2m</span>
                </div>

                <div className="ml-8 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-600 mb-0.5">Nombre</div>
                            <div className="h-2 bg-blue-200 rounded w-3/4"></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-sm text-green-600">✓</div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-600 mb-0.5">Presupuesto</div>
                            <div className="h-2 bg-green-200 rounded w-1/2"></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-sm text-orange-500">⏳</div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-600 mb-0.5">Zona preferida</div>
                            <div className="h-2 bg-gray-300 rounded w-1/3"></div>
                        </div>
                    </div>
                </div>

                <div className="mt-3 text-xs text-blue-600 font-medium">75% completo</div>
            </Card>
            <Card className="aspect-3/5 absolute -top-4 right-0 flex w-2/5 translate-y-4 p-2 transition-transform duration-200 ease-in-out group-hover:rotate-3">
                <div className="m-auto text-center">
                    <div className="text-lg mb-1">📎</div>
                    <div className="text-xs font-medium text-blue-600">PERFIL</div>
                    <div className="text-xs font-medium text-blue-600">ÚNICO</div>
                </div>
            </Card>
        </div>
    )
}

const WhatsAppConnectionIllustration = () => {
    return (
        <div
            aria-hidden
            className="mask-b-from-50 -mx-2 -mt-2 px-2 pt-2">
            <Card className="aspect-video translate-y-4 p-4 pb-6 transition-transform duration-200 group-hover:translate-y-0">
                <div className="w-fit">
                    <MessageCircle className="size-3.5 fill-green-300 stroke-green-300" />
                    <p className="mt-2 line-clamp-2 text-sm">Me interesa la casa en Palmira. ¿Podríamos coordinar una visita?</p>
                </div>
                <div className="bg-foreground/5 -mx-3 -mb-3 mt-3 space-y-3 rounded-lg p-3">
                    <div className="text-muted-foreground text-sm">Contactar por WhatsApp</div>

                    <div className="flex justify-between">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-7 rounded-2xl bg-transparent shadow-none">
                                <Plus />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-7 rounded-2xl bg-transparent shadow-none">
                                <Globe />
                            </Button>
                        </div>

                        <Button
                            size="icon"
                            className="size-7 rounded-2xl bg-green-600 hover:bg-green-700">
                            <ArrowUp strokeWidth={3} />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}