'use client'
import Link from 'next/link'
import { Logo, LogoIcon } from '@/components/logo'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'

const menuItems = [
    { name: 'Propiedades', href: '/propiedades' },
    { name: 'Publicar', href: '/publicar' },
]

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className={cn('fixed z-20 w-full transition-all duration-300 border-b', isScrolled ? 'bg-background/80 border-[#e5e7eb] backdrop-blur-lg' : 'border-transparent')}>
                <div className="relative w-full flex items-center h-20 px-4 sm:px-6 lg:px-8 transition-all duration-200">
                        {/* Logo - Absolute Left */}
                        <div className="absolute left-4 sm:left-6 lg:left-8 flex items-center">
                            <Link
                                href="/"
                                aria-label="inicio"
                                className="flex items-center space-x-2">
                                {/* Desktop: Full logo, Mobile: Icon only */}
                                <div className="hidden lg:block">
                                    <Logo />
                                </div>
                                <div className="lg:hidden">
                                    <LogoIcon />
                                </div>
                            </Link>
                        </div>

                        {/* Navigation + Action Buttons - Absolute Right */}
                        <div className="absolute right-4 sm:right-6 lg:right-8 hidden lg:flex lg:items-center lg:gap-3">
                            {/* Navigation Menu */}
                            {menuItems.map((item, index) => (
                                <Link key={index} href={item.href}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200">
                                        <span>{item.name}</span>
                                    </Button>
                                </Link>
                            ))}

                            {/* Login Button */}
                            <Link href="/iniciar-sesion">
                                <Button
                                    size="sm"
                                    className="text-sm font-medium transition-colors duration-200"
                                    style={{
                                        backgroundColor: '#000000',
                                        color: 'white',
                                        border: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#374151'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#000000'
                                    }}>
                                    <span>Iniciar Sesión</span>
                                </Button>
                            </Link>
                        </div>

                        {/* Mobile Menu Button - Absolute Right */}
                        <button
                            onClick={() => setMenuState(!menuState)}
                            aria-label={menuState == true ? 'Cerrar Menú' : 'Abrir Menú'}
                            className="absolute right-4 sm:right-6 lg:right-8 z-20 block cursor-pointer p-2.5 lg:hidden transition-all duration-300 hover:scale-110 hover:bg-muted/50 rounded-full">
                            <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                            <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    <div className="in-data-[state=active]:block hidden lg:hidden fixed top-20 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-30">
                        <div className="p-6 space-y-6">
                            {/* Navigation Links */}
                            <ul className="space-y-4">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-gray-700 hover:text-gray-900 block text-lg font-medium py-2">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            {/* Login Button */}
                            <div className="pt-4 border-t border-gray-200">
                                <Link href="/iniciar-sesion" className="block">
                                    <Button
                                        size="lg"
                                        className="w-full text-base font-medium transition-colors duration-200"
                                        style={{
                                            backgroundColor: '#000000',
                                            color: 'white',
                                            border: 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#374151'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#000000'
                                        }}>
                                        <span>Iniciar Sesión</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
            </nav>
        </header>
    )
}