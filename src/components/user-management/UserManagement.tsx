
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Users, Shield } from "lucide-react";
import { toast } from "sonner";
import { useUserProfile, UserProfile, UserRole, UserRoleData } from "@/hooks/useUserProfile";

interface UserWithRoles extends UserProfile {
  roles: UserRoleData[];
  primaryRole?: UserRole;
}

const ROLE_LABELS: Record<UserRole, string> = {
  superuser: "Super User",
  administrator: "Administrator", 
  secretary: "Secretary",
  treasurer: "Treasurer",
  board_member: "Board Member",
  member: "Member",
  viewer: "Viewer"
};

const ROLE_COLORS: Record<UserRole, string> = {
  superuser: "bg-red-100 text-red-800",
  administrator: "bg-purple-100 text-purple-800",
  secretary: "bg-blue-100 text-blue-800",
  treasurer: "bg-green-100 text-green-800",
  board_member: "bg-orange-100 text-orange-800",
  member: "bg-gray-100 text-gray-800",
  viewer: "bg-slate-100 text-slate-800"
};

export function UserManagement() {
  const { profile: currentUser, canManageUsers } = useUserProfile();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['usersWithRoles'],
    queryFn: async () => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: allRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles: UserWithRoles[] = profiles.map(profile => {
        const userRoles = allRoles.filter(r => r.user_id === profile.id);
        const primaryRole = userRoles[0]?.role;
        
        return {
          ...profile,
          roles: userRoles,
          primaryRole
        };
      });

      return usersWithRoles;
    },
    enabled: canManageUsers(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole, reason }: { userId: string, newRole: UserRole, reason?: string }) => {
      const user = users?.find(u => u.id === userId);
      if (!user) throw new Error('User not found');

      const oldRole = user.primaryRole;

      // Delete existing role for this user (single role per user)
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Insert new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole,
          appointed_by: currentUser?.id,
          appointed_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Log role change
      const { error: logError } = await supabase
        .from('role_changes')
        .insert({
          user_id: userId,
          old_role: oldRole || 'viewer',
          new_role: newRole,
          changed_by: currentUser?.id,
          reason: reason || `Role changed from ${oldRole ? ROLE_LABELS[oldRole] : 'None'} to ${ROLE_LABELS[newRole]}`
        });

      if (logError) console.error('Failed to log role change:', logError);
    },
    onSuccess: () => {
      toast.success("User role updated successfully");
      queryClient.invalidateQueries({ queryKey: ['usersWithRoles'] });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
    },
    onError: (error) => {
      toast.error("Failed to update user role: " + error.message);
    },
  });


  if (!canManageUsers()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Denied
          </CardTitle>
          <CardDescription>
            You don't have permission to manage users.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user roles and permissions for the cooperative
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Appointed By</TableHead>
                    <TableHead>Manage Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.full_name || 'No name'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.primaryRole ? (
                          <Badge className={ROLE_COLORS[user.primaryRole]}>
                            {ROLE_LABELS[user.primaryRole]}
                          </Badge>
                        ) : (
                          <Badge variant="outline">No Role</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>{user.member_id || 'Not assigned'}</TableCell>
                      <TableCell>
                        {user.roles[0]?.appointed_by ? (
                          <div className="text-sm">
                            {users?.find(u => u.id === user.roles[0].appointed_by)?.full_name || 'Unknown'}
                          </div>
                        ) : (
                          'Not assigned'
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.primaryRole || ''}
                          onValueChange={(newRole: UserRole) => 
                            updateRoleMutation.mutate({ userId: user.id, newRole })
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Assign role" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ROLE_LABELS).map(([role, label]) => (
                              <SelectItem key={role} value={role}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
