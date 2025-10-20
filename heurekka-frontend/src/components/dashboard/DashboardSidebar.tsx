"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import { getTabsForRole, UserRole, shouldShowRoleSeparator } from "@/lib/dashboard-tabs"

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    email: string
    avatar?: string
    role: UserRole
  }
  stats?: Record<string, number>
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function DashboardSidebar({
  user,
  stats,
  activeTab,
  onTabChange,
  ...props
}: DashboardSidebarProps) {
  const router = useRouter()
  const tabs = getTabsForRole(user.role, stats)
  const showSeparator = shouldShowRoleSeparator(user.role)

  // For dual-context users, split tabs into landlord, tenant, navigation, and shared sections
  const landlordTabs = tabs.filter(tab => tab.role === 'landlord')
  const tenantTabs = tabs.filter(tab => tab.role === 'tenant')
  const navigationTabs = tabs.filter(tab => tab.role === 'navigation')
  const sharedTabs = tabs.filter(tab => tab.role === 'shared')

  console.log('🎨 DashboardSidebar - Rendering:', {
    userRole: user.role,
    totalTabs: tabs.length,
    landlordTabsCount: landlordTabs.length,
    tenantTabsCount: tenantTabs.length,
    navigationTabsCount: navigationTabs.length,
    sharedTabsCount: sharedTabs.length,
    showSeparator,
    tabs,
  })

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" onClick={() => router.push("/")} className="hover:bg-transparent">
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Show all tabs in order for single-role users, or split by role for dual users */}
        {showSeparator ? (
          <>
            {/* Landlord Section */}
            {landlordTabs.length > 0 && (
              <SidebarGroup>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                  Gestión
                </div>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {landlordTabs.map((tab) => (
                      <SidebarMenuItem key={tab.id}>
                        <SidebarMenuButton
                          onClick={() => onTabChange(tab.id)}
                          isActive={activeTab === tab.id}
                        >
                          <tab.icon className="size-4" />
                          <span>{tab.label}</span>
                          {tab.badge && tab.badge > 0 && (
                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">
                              {tab.badge > 99 ? '99+' : tab.badge}
                            </span>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Separator */}
            {landlordTabs.length > 0 && tenantTabs.length > 0 && (
              <div className="px-2 py-2">
                <Separator />
              </div>
            )}

            {/* Tenant Section */}
            {tenantTabs.length > 0 && (
              <SidebarGroup>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                  Inquilino
                </div>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {tenantTabs.map((tab) => (
                      <SidebarMenuItem key={tab.id}>
                        <SidebarMenuButton
                          onClick={() => onTabChange(tab.id)}
                          isActive={activeTab === tab.id}
                        >
                          <tab.icon className="size-4" />
                          <span>{tab.label}</span>
                          {tab.badge && tab.badge > 0 && (
                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">
                              {tab.badge > 99 ? '99+' : tab.badge}
                            </span>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Separator before navigation tabs */}
            {(landlordTabs.length > 0 || tenantTabs.length > 0) && navigationTabs.length > 0 && (
              <div className="px-2 py-2">
                <Separator />
              </div>
            )}

            {/* Navigation Section (Búsquedas Guardadas, Favoritos, Conversaciones) */}
            {navigationTabs.length > 0 && (
              <SidebarGroup>
                {showSeparator && (
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                    Explorar
                  </div>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationTabs.map((tab) => (
                      <SidebarMenuItem key={tab.id}>
                        <SidebarMenuButton
                          onClick={() => onTabChange(tab.id)}
                          isActive={activeTab === tab.id}
                        >
                          <tab.icon className="size-4" />
                          <span>{tab.label}</span>
                          {tab.badge && tab.badge > 0 && (
                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">
                              {tab.badge > 99 ? '99+' : tab.badge}
                            </span>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Shared Section (Profile) */}
            {sharedTabs.length > 0 && (
              <>
                <div className="px-2 py-2">
                  <Separator />
                </div>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {sharedTabs.map((tab) => (
                        <SidebarMenuItem key={tab.id}>
                          <SidebarMenuButton
                            onClick={() => onTabChange(tab.id)}
                            isActive={activeTab === tab.id}
                          >
                            <tab.icon className="size-4" />
                            <span>{tab.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </>
            )}
          </>
        ) : (
          // Single role - show all tabs in order
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {tabs.map((tab) => (
                  <SidebarMenuItem key={tab.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(tab.id)}
                      isActive={activeTab === tab.id}
                    >
                      <tab.icon className="size-4" />
                      <span>{tab.label}</span>
                      {tab.badge && tab.badge > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">
                          {tab.badge > 99 ? '99+' : tab.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => onTabChange('profile')}
              className="cursor-pointer hover:bg-accent"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium text-sm">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
