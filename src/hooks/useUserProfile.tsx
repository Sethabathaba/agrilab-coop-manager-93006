
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type UserRole = 'superuser' | 'administrator' | 'secretary' | 'treasurer' | 'board_member' | 'member' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  member_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  appointed_by?: string;
  appointed_at?: string;
  created_at: string;
}

export function useUserProfile() {
  const { user } = useAuth();

  // Fetch user profile
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user?.id,
  });

  // Fetch user roles from user_roles table
  const { data: userRoles, isLoading: rolesLoading, error: rolesError, refetch } = useQuery({
    queryKey: ['userRoles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as UserRoleData[];
    },
    enabled: !!user?.id,
  });

  // Get primary role (highest privilege)
  const primaryRole: UserRole | undefined = userRoles?.[0]?.role;

  const hasRole = (role: UserRole): boolean => {
    return !!userRoles?.some(r => r.role === role);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return !!userRoles?.some(r => roles.includes(r.role));
  };

  const canAccessFinancials = (): boolean => {
    return hasAnyRole(['superuser', 'administrator', 'treasurer']);
  };

  const canManageUsers = (): boolean => {
    return hasAnyRole(['superuser', 'administrator']);
  };

  const canUploadDocuments = (): boolean => {
    return hasAnyRole(['superuser', 'administrator', 'secretary', 'treasurer', 'board_member']);
  };

  const isLoading = profileLoading || rolesLoading;
  const error = profileError || rolesError;

  return {
    profile,
    primaryRole,
    userRoles,
    isLoading,
    error,
    refetch,
    hasRole,
    hasAnyRole,
    canAccessFinancials,
    canManageUsers,
    canUploadDocuments,
  };
}
