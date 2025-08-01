
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Receipt, CreditCard, FileText } from "lucide-react";

const quickActions = [
  {
    title: "Add New Member",
    description: "Register a new cooperative member",
    icon: UserPlus,
    href: "/members/new"
  },
  {
    title: "Record Transaction",
    description: "Add new journal entry",
    icon: Receipt,
    href: "/financials/journal/new"
  },
  {
    title: "Process Payment",
    description: "Handle member payments",
    icon: CreditCard,
    href: "/payments/process"
  },
  {
    title: "Generate Report",
    description: "Create financial statement",
    icon: FileText,
    href: "/reports/financial"
  }
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start h-auto p-3"
            asChild
          >
            <a href={action.href}>
              <action.icon className="mr-3 h-4 w-4 text-primary" />
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </a>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
