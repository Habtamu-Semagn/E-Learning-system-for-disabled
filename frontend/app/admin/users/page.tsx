'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout-new';
import { useCommonShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { usersAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Search, Edit, Trash2 } from 'lucide-react';
import { AddUserDialog } from '@/components/dialogs/add-user-dialog';
import { EditUserDialog } from '@/components/dialogs/edit-user-dialog';
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirm-dialog';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  courses?: number;
  joined: string;
}

export default function AdminUsersPage() {
  useCommonShortcuts('admin');

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (searchQuery) params.search = searchQuery;

      const data = await usersAPI.getAll(params);
      setUsers(data.map((u: any) => ({
        id: u.id,
        name: u.full_name,
        email: u.email,
        role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
        status: u.approval_status === 'approved' ? 'Active' : 'Inactive',
        courses: 0, // Backend doesn't return course count here yet
        joined: new Date(u.created_at).toISOString().split('T')[0]
      })));
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const filteredUsers = users; // Filtering is handled by API

  const handleDelete = async () => {
    if (deletingUser) {
      try {
        await usersAPI.delete(deletingUser.id);
        setUsers(users.filter(u => u.id !== deletingUser.id));
        setDeletingUser(null);
      } catch (err: any) {
        console.error('Failed to delete user:', err);
        setError('Failed to delete user');
      }
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin User" userRole="Administrator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
            <p className="text-gray-600 mt-1">View and manage all platform users</p>
          </div>
          <AddUserDialog onSuccess={fetchUsers} />
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  placeholder="Search users by name or email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search users"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={roleFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setRoleFilter('all')}
                >
                  All Users
                </Button>
                <Button
                  variant={roleFilter === 'student' ? 'default' : 'outline'}
                  onClick={() => setRoleFilter('student')}
                >
                  Students
                </Button>
                <Button
                  variant={roleFilter === 'teacher' ? 'default' : 'outline'}
                  onClick={() => setRoleFilter('teacher')}
                >
                  Teachers
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.role === 'Teacher'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.courses}</TableCell>
                    <TableCell>{user.joined}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingUser(user)}
                                aria-label={`Edit ${user.name}`}
                              >
                                <Edit className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit user</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeletingUser(user)}
                                aria-label={`Delete ${user.name}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete user</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <EditUserDialog
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        onSave={(updatedUser) => {
          setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
          fetchUsers();
        }}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        onConfirm={handleDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${deletingUser?.name}? This action cannot be undone.`}
      />
    </DashboardLayout>
  );
}
