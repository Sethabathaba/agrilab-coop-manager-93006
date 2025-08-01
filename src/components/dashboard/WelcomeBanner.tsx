
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function WelcomeBanner() {
  const { user } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  const currentDate = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Extract name from email (before @) as fallback if no display name
  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "Member";
  };

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data: documents } = await supabase
          .from('documents')
          .select('file_name, file_path')
          .ilike('file_name', '%logo%')
          .limit(1);

        if (documents && documents.length > 0) {
          const { data } = supabase.storage
            .from('documents')
            .getPublicUrl(documents[0].file_path);
          setLogoUrl(data.publicUrl);
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
      }
    };

    fetchLogo();
  }, []);

  return (
    <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt="Tsheseng Unity Enterprise Logo" 
                className="h-16 w-16 object-contain rounded-lg bg-white/10 p-2"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome, {getUserName()}!</h2>
              <p className="text-primary-foreground/80">
                Manage your cooperative efficiently and transparently
              </p>
            </div>
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
