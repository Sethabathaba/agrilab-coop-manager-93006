
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, DollarSign, UserPlus, CreditCard, TrendingUp } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "payment",
    description: "Membership fee payment",
    member: "John Doe",
    amount: "R 500",
    time: "2 hours ago",
    status: "completed",
    icon: DollarSign
  },
  {
    id: 2,
    type: "member",
    description: "New member registration",
    member: "Jane Smith",
    amount: "",
    time: "4 hours ago",
    status: "pending",
    icon: UserPlus
  },
  {
    id: 3,
    type: "loan",
    description: "Loan disbursement",
    member: "Mike Johnson",
    amount: "R 15,000",
    time: "1 day ago",
    status: "completed",
    icon: CreditCard
  },
  {
    id: 4,
    type: "shares",
    description: "Share purchase",
    member: "Sarah Wilson",
    amount: "R 2,500",
    time: "2 days ago",
    status: "completed",
    icon: TrendingUp
  }
];

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <activity.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {activity.description}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {activity.member} • {activity.time}
                </p>
                {activity.amount && (
                  <Badge variant="secondary" className="text-xs">
                    {activity.amount}
                  </Badge>
                )}
              </div>
            </div>
            <Badge
              variant={activity.status === "completed" ? "default" : "secondary"}
              className="text-xs"
            >
              {activity.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
