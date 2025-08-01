
import { useState, useEffect } from "react";
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
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  appointed_by?: string;
  appointed_at?: string;
  created_at: string;
  updated_at: string;
}

export function useUserProfile() {
  const { user } = useAuth();

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user?.id,
  });

  const hasRole = (role: UserRole): boolean => {
    return profile?.role === role && profile?.status === 'active';
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return !!profile && roles.includes(profile.role) && profile.status === 'active';
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

  return {
    profile,
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
