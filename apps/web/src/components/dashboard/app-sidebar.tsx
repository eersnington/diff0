"use client";

import {
  CreditCard,
  GitBranch,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import type * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Repositories",
      url: "/repositories",
      icon: GitBranch,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "GitHub Integration",
          url: "/settings",
        },
        {
          title: "Profile",
          url: "/settings/profile",
        },
      ],
    },
    {
      title: "Billing",
      url: "/billing",
      icon: CreditCard,
      items: [
        {
          title: "Credits",
          url: "/billing",
        },
        {
          title: "History",
          url: "/billing/history",
        },
      ],
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher user={user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
