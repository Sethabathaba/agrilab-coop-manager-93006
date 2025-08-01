
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
import { useUserProfile, UserProfile, UserRole } from "@/hooks/useUserProfile";

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
  const [selectedRole, setSelectedRole] = useState<UserRole>('viewer');
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: canManageUsers(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole, reason }: { userId: string, newRole: UserRole, reason?: string }) => {
      const user = users?.find(u => u.id === userId);
      if (!user) throw new Error('User not found');

      // Update user role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: newRole, 
          status: 'active',
          appointed_by: currentUser?.id,
          appointed_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Log role change
      const { error: logError } = await supabase
        .from('role_changes')
        .insert({
          user_id: userId,
          old_role: user.role,
          new_role: newRole,
          changed_by: currentUser?.id,
          reason: reason || `Role changed from ${ROLE_LABELS[user.role]} to ${ROLE_LABELS[newRole]}`
        });

      if (logError) console.error('Failed to log role change:', logError);
    },
    onSuccess: () => {
      toast.success("User role updated successfully");
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error("Failed to update user role: " + error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string, status: 'active' | 'inactive' | 'pending' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User status updated successfully");
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error("Failed to update user status: " + error.message);
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
                    <TableHead>Actions</TableHead>
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
                        <Badge className={ROLE_COLORS[user.role]}>
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          user.status === 'active' ? 'default' : 
                          user.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.member_id || 'Not assigned'}</TableCell>
                      <TableCell>
                        {user.appointed_by ? (
                          <div className="text-sm">
                            {users?.find(u => u.id === user.appointed_by)?.full_name || 'Unknown'}
                          </div>
                        ) : (
                          'Auto-registered'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Select
                            value={user.role}
                            onValueChange={(newRole: UserRole) => 
                              updateRoleMutation.mutate({ userId: user.id, newRole })
                            }
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ROLE_LABELS).map(([role, label]) => (
                                <SelectItem key={role} value={role}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={user.status}
                            onValueChange={(status: 'active' | 'inactive' | 'pending') => 
                              updateStatusMutation.mutate({ userId: user.id, status })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
