
import { WelcomeBanner } from "./WelcomeBanner";
import { KPICards } from "./KPICards";
import { FinancialOverview } from "./FinancialOverview";
import { RecentActivity } from "./RecentActivity";
import { QuickActions } from "./QuickActions";

export function DashboardContent() {
  return (
    <div className="space-y-6">
      <WelcomeBanner />
      <KPICards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FinancialOverview />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
