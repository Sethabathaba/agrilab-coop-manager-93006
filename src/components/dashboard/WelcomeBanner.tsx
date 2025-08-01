
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export function WelcomeBanner() {
  const currentDate = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome, Executive Board!</h2>
            <p className="text-primary-foreground/80">
              Manage your cooperative efficiently and transparently
            </p>
          </div>
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{currentDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
