
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Banknote, Wallet, Clock, UserCheck } from "lucide-react";

const kpiData = [
  {
    title: "Total Members",
    value: "30",
    change: "+2 this month",
    icon: Users,
    trend: "up"
  },
  {
    title: "Total Shares Issued",
    value: "R 450,000",
    change: "+15% from last quarter",
    icon: TrendingUp,
    trend: "up"
  },
  {
    title: "Outstanding Loans",
    value: "R 125,000",
    change: "3 active loans",
    icon: Banknote,
    trend: "neutral"
  },
  {
    title: "Cash Balance",
    value: "R 75,320",
    change: "Capitec Bank",
    icon: Wallet,
    trend: "up"
  },
  {
    title: "Pending Payments",
    value: "12",
    change: "Due this week",
    icon: Clock,
    trend: "down"
  },
  {
    title: "New Applications",
    value: "3",
    change: "Awaiting approval",
    icon: UserCheck,
    trend: "neutral"
  }
];

export function KPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpiData.map((kpi, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpi.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
