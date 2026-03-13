'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout-new';
import { useCommonShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { RouteGuard } from '@/lib/route-guard';
import { useAuth } from '@/lib/auth-context';
import { approvalsAPI } from '@/lib/api';
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
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Clock, CheckCircle, XCircle, Eye, Ear, IdCard, Loader2 } from 'lucide-react';

interface PendingUser {
  id: number;
  full_name: string;
  email: string;
  school_id: string;
  disability_type: string;
  created_at: string;
}

export default function AdminApprovalsPage() {
  useCommonShortcuts('admin');
  const { user } = useAuth();
  
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const data = await approvalsAPI.getPending();
      setPendingUsers(data);
    } catch (err: any) {
      console.error('Error fetching approvals:', err);
      setError(err.message || 'Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      setProcessingId(userId);
      await approvalsAPI.approve(userId);
      // Remove from list after successful approval
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (err: any) {
      console.error('Error approving user:', err);
      alert(err.message || 'Failed to approve user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: number) => {
    try {
      setProcessingId(userId);
      const reason = prompt('Enter rejection reason (optional):');
      await approvalsAPI.reject(userId, reason || undefined);
      // Remove from list after successful rejection
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (err: any) {
      console.error('Error rejecting user:', err);
      alert(err.message || 'Failed to reject user');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <RouteGuard allowedRoles={['admin']}>
      <DashboardLayout role="admin" userName={user?.full_name || 'Admin User'} userRole="Administrator">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
            <p className="text-gray-600 mt-1">Review and approve student registrations</p>
          </div>

          {/* Error Message */}
          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <p className="text-red-800">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-700" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold">{loading ? '...' : pendingUsers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-700" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Approved Today</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-700" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rejected Today</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Student Registrations ({loading ? '...' : pendingUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" aria-hidden="true" />
                  <p className="text-gray-600">Loading pending approvals...</p>
                </div>
              ) : pendingUsers.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                  <p className="text-gray-600">No pending approvals</p>
                  <p className="text-sm text-gray-500 mt-1">All registrations have been processed</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>School ID</TableHead>
                      <TableHead>Disability Type</TableHead>
                      <TableHead>Submitted Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <IdCard className="h-4 w-4 text-gray-400" aria-hidden="true" />
                            {user.school_id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.disability_type.toLowerCase().includes('blind') || user.disability_type.toLowerCase().includes('visual') ? (
                              <>
                                <Eye className="h-4 w-4 text-gray-600" aria-hidden="true" />
                                <span>Visual</span>
                              </>
                            ) : (
                              <>
                                <Ear className="h-4 w-4 text-gray-600" aria-hidden="true" />
                                <span>Hearing</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleApprove(user.id)}
                                    disabled={processingId === user.id}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    {processingId === user.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" aria-hidden="true" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Approve registration</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleReject(user.id)}
                                    disabled={processingId === user.id}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4" aria-hidden="true" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Reject registration</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <IdCard className="h-5 w-5 text-blue-700" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">School ID Validation</h3>
                  <p className="text-sm text-blue-800">
                    All student registrations require a valid school ID starting with "BDU". 
                    Each school ID can only be used once to prevent duplicate accounts.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
