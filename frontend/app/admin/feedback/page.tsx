'use client';

import { useState, useEffect } from 'react';
import { feedbackAPI } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard-layout-new';
import { useCommonShortcuts } from '@/hooks/use-keyboard-shortcuts';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  User,
  Loader2
} from 'lucide-react';

interface Feedback {
  id: number;
  user: string;
  userRole: 'Student' | 'Teacher';
  subject: string;
  message: string;
  category: 'Bug' | 'Feature Request' | 'Accessibility' | 'General';
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  submittedDate: string;
  adminResponse?: string;
}

export default function AdminFeedbackPage() {
  useCommonShortcuts('admin');

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await feedbackAPI.getAll();
      setFeedbacks(data.map((f: any) => ({
        id: f.id,
        user: f.full_name,
        userRole: (f.role || 'Student').charAt(0).toUpperCase() + (f.role || 'Student').slice(1),
        subject: f.subject,
        message: f.message,
        category: f.category,
        priority: (f.priority || 'Medium').charAt(0).toUpperCase() + (f.priority || 'Medium').slice(1),
        status: f.status === 'in_progress' ? 'In Progress' : (f.status || 'Open').charAt(0).toUpperCase() + (f.status || 'Open').slice(1),
        submittedDate: new Date(f.created_at).toISOString().split('T')[0],
        adminResponse: f.admin_response
      })));
    } catch (err: any) {
      console.error('Failed to fetch feedback:', err);
      setError(err.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [response, setResponse] = useState('');

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setViewDialogOpen(true);
    setResponse('');
  };

  const handleStatusChange = async (feedbackId: number, newStatus: Feedback['status']) => {
    try {
      const apiStatus = newStatus.toLowerCase().replace(' ', '_');
      await feedbackAPI.updateStatus(feedbackId, apiStatus);
      setFeedbacks(feedbacks.map(f =>
        f.id === feedbackId ? { ...f, status: newStatus } : f
      ));
      if (selectedFeedback?.id === feedbackId) {
        setSelectedFeedback({ ...selectedFeedback, status: newStatus });
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setError('Failed to update status');
    }
  };

  const [isSending, setIsSending] = useState(false);
  const handleSendResponse = async () => {
    if (!selectedFeedback) return;
    try {
      setIsSending(true);
      const apiStatus = selectedFeedback.status.toLowerCase().replace(' ', '_');
      await feedbackAPI.updateStatus(selectedFeedback.id, apiStatus, response);
      await fetchFeedbacks(); // Refresh to get admin response
      setViewDialogOpen(false);
      setResponse('');
    } catch (err: any) {
      console.error('Failed to send response:', err);
      setError('Failed to send response');
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Open</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-600">In Progress</Badge>;
      case 'Resolved':
        return <Badge className="bg-green-600">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="destructive">High</Badge>;
      case 'Medium':
        return <Badge className="bg-yellow-600">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const stats = {
    total: feedbacks.length,
    open: feedbacks.filter(f => f.status === 'Open').length,
    inProgress: feedbacks.filter(f => f.status === 'In Progress').length,
    resolved: feedbacks.filter(f => f.status === 'Resolved').length,
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-gray-600 mt-1">Review and respond to user feedback</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-700" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-700" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Open</p>
                  <p className="text-2xl font-bold">{stats.open}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-blue-700" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
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
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Feedback ({feedbacks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No feedback received yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          <div>
                            <p className="font-medium">{feedback.user}</p>
                            <p className="text-xs text-gray-600">{feedback.userRole}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate">{feedback.subject}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{feedback.category}</Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(feedback.priority)}</TableCell>
                      <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                      <TableCell>{feedback.submittedDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewFeedback(feedback)}
                                >
                                  <Eye className="h-4 w-4" aria-hidden="true" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {feedback.status !== 'Resolved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(feedback.id, 'Resolved')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Feedback Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              Review and respond to user feedback
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">User</p>
                  <p className="font-medium">{selectedFeedback.user} ({selectedFeedback.userRole})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{selectedFeedback.submittedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <Badge variant="outline">{selectedFeedback.category}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  {getPriorityBadge(selectedFeedback.priority)}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Subject</p>
                <p className="font-medium">{selectedFeedback.subject}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Message</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm">{selectedFeedback.message}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <div className="flex gap-2">
                  <Button
                    variant={selectedFeedback.status === 'Open' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      handleStatusChange(selectedFeedback.id, 'Open');
                      setSelectedFeedback({ ...selectedFeedback, status: 'Open' });
                    }}
                  >
                    Open
                  </Button>
                  <Button
                    variant={selectedFeedback.status === 'In Progress' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      handleStatusChange(selectedFeedback.id, 'In Progress');
                      setSelectedFeedback({ ...selectedFeedback, status: 'In Progress' });
                    }}
                  >
                    In Progress
                  </Button>
                  <Button
                    variant={selectedFeedback.status === 'Resolved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      handleStatusChange(selectedFeedback.id, 'Resolved');
                      setSelectedFeedback({ ...selectedFeedback, status: 'Resolved' });
                    }}
                  >
                    Resolved
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Send Response (Optional)</p>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response to the user..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSendResponse} disabled={!response || isSending}>
              {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSending ? 'Sending...' : 'Send Response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
