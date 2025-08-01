
import {
  LayoutDashboard,
  Users,
  DollarSign,
  CreditCard,
  Receipt,
  FileText,
  Settings,
  Building2,
  TrendingUp,
  Wallet,
  UserPlus,
  FileCheck,
  BookOpen,
  Calculator,
  PiggyBank,
  HandCoins,
  Banknote,
  BarChart3,
  Shield,
  Cog
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Members",
    icon: Users,
    items: [
      { title: "Member List", url: "/members", icon: Users },
      { title: "Add New Member", url: "/members/new", icon: UserPlus },
      { title: "Member Applications", url: "/members/applications", icon: FileCheck },
    ],
  },
  {
    title: "Financials",
    icon: DollarSign,
    items: [
      { title: "Chart of Accounts", url: "/financials/accounts", icon: BookOpen },
      { title: "Journal Entries", url: "/financials/journal", icon: Receipt },
      { title: "Cash Book", url: "/financials/cashbook", icon: Calculator },
      { title: "Ledgers", url: "/financials/ledgers", icon: FileText },
    ],
  },
  {
    title: "Loans & Shares",
    icon: CreditCard,
    items: [
      { title: "Manage Loans", url: "/loans", icon: Banknote },
      { title: "Manage Shares", url: "/shares", icon: TrendingUp },
      { title: "Loan Applications", url: "/loans/applications", icon: FileCheck },
      { title: "Share Transfers", url: "/shares/transfers", icon: HandCoins },
    ],
  },
  {
    title: "Payments",
    icon: Wallet,
    items: [
      { title: "Process Payments", url: "/payments/process", icon: CreditCard },
      { title: "Payment History", url: "/payments/history", icon: Receipt },
      { title: "Payment Gateway Settings", url: "/payments/settings", icon: Settings },
    ],
  },
  {
    title: "Reports",
    icon: BarChart3,
    items: [
      { title: "Financial Statements", url: "/reports/financial", icon: FileText },
      { title: "Member Contribution Reports", url: "/reports/contributions", icon: PiggyBank },
      { title: "Loan Portfolio Reports", url: "/reports/loans", icon: Banknote },
      { title: "Audit Trail", url: "/reports/audit", icon: Shield },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      { title: "Co-operative Details", url: "/settings/cooperative", icon: Building2 },
      { title: "User Management", url: "/settings/users", icon: Users },
      { title: "System Configuration", url: "/settings/system", icon: Cog },
    ],
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold text-primary">
            Tsheseng Unity
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible defaultOpen className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full justify-between">
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <a href={subItem.url} className="flex items-center gap-2">
                                  <subItem.icon className="h-3 w-3" />
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
