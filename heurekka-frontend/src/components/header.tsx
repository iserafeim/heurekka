'use client'
import Link from 'next/link'
import { Logo, LogoIcon } from '@/components/logo'
import { Menu, X, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LandlordAuthFlow } from '@/components/auth/LandlordAuthFlow'
import { TenantAuthFlow } from '@/components/auth/TenantAuthFlow'
import { useAuthStore } from '@/lib/stores/auth'
import React from 'react'
import { cn } from '@/lib/utils'

const menuItems = [
    { name: 'Propiedades', href: '/propiedades' },
    { name: 'Publicar', href: '/publicar' },
]

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [showLandlordAuth, setShowLandlordAuth] = React.useState(false)
    const [showLoginModal, setShowLoginModal] = React.useState(false)
    const [showUserMenu, setShowUserMenu] = React.useState(false)

    const { isAuthenticated, user, signOut } = useAuthStore()

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = async () => {
        await signOut()
        setShowUserMenu(false)
    }
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
                            {menuItems.map((item, index) => {
                                if (item.name === 'Publicar') {
                                    return (
                                        <Button
                                            key={index}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowLandlordAuth(true)}
                                            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200">
                                            <span>{item.name}</span>
                                        </Button>
                                    )
                                }
                                return (
                                    <Link key={index} href={item.href}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200">
                                            <span>{item.name}</span>
                                        </Button>
                                    </Link>
                                )
                            })}

                            {/* Auth Section */}
                            {isAuthenticated ? (
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span className="text-sm font-medium">{user?.email?.split('@')[0]}</span>
                                    </Button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                            <Link href="/dashboard" onClick={() => setShowUserMenu(false)}>
                                                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    Mi Perfil
                                                </button>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                <LogOut className="h-4 w-4" />
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={() => setShowLoginModal(true)}
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
                            )}
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
                                {menuItems.map((item, index) => {
                                    if (item.name === 'Publicar') {
                                        return (
                                            <li key={index}>
                                                <button
                                                    onClick={() => {
                                                        setShowLandlordAuth(true);
                                                        setMenuState(false);
                                                    }}
                                                    className="text-gray-700 hover:text-gray-900 block text-lg font-medium py-2 w-full text-left">
                                                    <span>{item.name}</span>
                                                </button>
                                            </li>
                                        )
                                    }
                                    return (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-gray-700 hover:text-gray-900 block text-lg font-medium py-2">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>

                            {/* Auth Section */}
                            <div className="pt-4 border-t border-gray-200">
                                {isAuthenticated ? (
                                    <div className="space-y-2">
                                        <div className="px-4 py-2 text-sm text-gray-700 font-medium">
                                            {user?.email}
                                        </div>
                                        <Link href="/dashboard" onClick={() => setMenuState(false)} className="block">
                                            <Button
                                                variant="ghost"
                                                size="lg"
                                                className="w-full justify-start text-base">
                                                <User className="h-4 w-4 mr-2" />
                                                Mi Perfil
                                            </Button>
                                        </Link>
                                        <Button
                                            onClick={() => {
                                                handleLogout();
                                                setMenuState(false);
                                            }}
                                            variant="ghost"
                                            size="lg"
                                            className="w-full justify-start text-base text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Cerrar Sesión
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        size="lg"
                                        onClick={() => {
                                            setShowLoginModal(true);
                                            setMenuState(false);
                                        }}
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
                                )}</div>
                        </div>
                    </div>
            </nav>

            {/* Landlord Authentication Flow */}
            <LandlordAuthFlow
                isOpen={showLandlordAuth}
                onClose={() => setShowLandlordAuth(false)}
                onSuccess={() => {
                    setShowLandlordAuth(false);
                    // TODO: Redirect to property listing wizard or dashboard
                    console.log('Landlord authentication successful');
                }}
            />

            {/* Login Modal - General authentication */}
            <TenantAuthFlow
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSuccess={() => {
                    setShowLoginModal(false);
                    console.log('Login successful');
                }}
            />
        </header>
    )
}