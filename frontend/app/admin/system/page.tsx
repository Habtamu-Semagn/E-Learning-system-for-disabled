'use client';

import { useState, useEffect } from 'react';
import { auditAPI } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard-layout-new';
import { useCommonShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Search,
  Filter,
  Download,
  User,
  Shield,
  LogIn,
  LogOut,
  UserPlus,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  userRole: 'Student' | 'Teacher' | 'Admin';
  action: string;
  category: 'Authentication' | 'User Management' | 'Course Management' | 'Content' | 'System';
  details: string;
  ipAddress: string;
}

export default function AdminAuditLogPage() {
  useCommonShortcuts('admin');

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statsData, setStatsData] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');

  useEffect(() => {
    fetchAuditLogs();
    fetchAuditStats();
  }, [filterCategory, filterAction]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = {};
      if (filterCategory !== 'all') params.entityType = filterCategory;
      if (filterAction !== 'all') params.action = filterAction;

      const data = await auditAPI.getAll(params);
      setAuditLogs(data.map((log: any) => ({
        id: log.id,
        timestamp: new Date(log.created_at).toLocaleString(),
        user: log.email || 'System',
        userRole: (log.role || 'System').charAt(0).toUpperCase() + (log.role || 'System').slice(1),
        action: log.action,
        category: (log.entity_type || 'System').charAt(0).toUpperCase() + (log.entity_type || 'System').slice(1),
        details: log.details || '',
        ipAddress: log.ip_address || 'N/A'
      })));
    } catch (err: any) {
      console.error('Failed to fetch audit logs:', err);
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditStats = async () => {
    try {
      const data = await auditAPI.getStats();
      setStatsData(data);
    } catch (err: any) {
      console.error('Failed to fetch audit stats:', err);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Login':
        return <LogIn className="h-4 w-4" aria-hidden="true" />;
      case 'Logout':
        return <LogOut className="h-4 w-4" aria-hidden="true" />;
      case 'Approve Account':
        return <UserPlus className="h-4 w-4" aria-hidden="true" />;
      case 'Edit Course':
        return <Edit className="h-4 w-4" aria-hidden="true" />;
      case 'Delete User':
        return <Trash2 className="h-4 w-4" aria-hidden="true" />;
      default:
        return <FileText className="h-4 w-4" aria-hidden="true" />;
    }
  };

  const stats = {
    totalLogs: statsData.length > 0 ? statsData.reduce((acc, curr) => acc + parseInt(curr.action_count), 0) : 0,
    uniqueUsers: statsData.length > 0 ? statsData[0].unique_users : 0,
    uniqueActions: statsData.length > 0 ? statsData[0].unique_actions : 0,
    adminActions: auditLogs.filter(log => log.userRole === 'Admin').length,
  };

  return (
    <DashboardLayout role="admin" userName="Admin User" userRole="Administrator">
      <div className="space-y-6">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
            <p className="text-gray-600 mt-1">Track all system activities and user actions</p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              // Simulated export
              const csvContent = "Timestamp,User,Action,Category,Details,IP\n" +
                auditLogs.map(log => `"${log.timestamp}","${log.user}","${log.action}","${log.category}","${log.details}","${log.ipAddress}"`).join("\n");
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement("a");
              const url = URL.createObjectURL(blob);
              link.setAttribute("href", url);
              link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export Logs
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-700" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Logs</p>
                  <p className="text-2xl font-bold">{stats.totalLogs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <User className="h-6 w-6 text-green-700" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unique Users</p>
                  <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-700" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Actions</p>
                  <p className="text-2xl font-bold">{stats.uniqueActions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-orange-700" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Admin Actions</p>
                  <p className="text-2xl font-bold">{stats.adminActions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  placeholder="Search by user or details..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search audit logs"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Authentication">Authentication</SelectItem>
                    <SelectItem value="User Management">User Management</SelectItem>
                    <SelectItem value="Course Management">Course Management</SelectItem>
                    <SelectItem value="Content">Content</SelectItem>
                    <SelectItem value="System">System</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="Login">Login</SelectItem>
                    <SelectItem value="Logout">Logout</SelectItem>
                    <SelectItem value="Create Course">Create Course</SelectItem>
                    <SelectItem value="Edit Course">Edit Course</SelectItem>
                    <SelectItem value="Delete User">Delete User</SelectItem>
                    <SelectItem value="Approve Account">Approve Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail ({filteredLogs.length} entries)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No logs found matching your criteria.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {log.timestamp}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          <div>
                            <p className="font-medium text-sm">{log.user}</p>
                            <p className="text-xs text-gray-600">{log.userRole}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className="text-sm">{log.action}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {log.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm truncate" title={log.details}>{log.details}</p>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-600">
                        {log.ipAddress}
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
                <FileText className="h-5 w-5 text-blue-700" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Audit Trail Information</h3>
                <p className="text-sm text-blue-800">
                  All user actions and system events are logged for security and compliance purposes.
                  Logs are retained for 90 days and can be exported for external analysis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
