'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout-new';
import { useCommonShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { coursesAPI } from '@/lib/api';
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
import { Search, Edit, Trash2, Eye } from 'lucide-react';
import { AddCourseDialog } from '@/components/dialogs/add-course-dialog';
import { EditCourseDialog } from '@/components/dialogs/edit-course-dialog';
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirm-dialog';

interface Course {
  id: number;
  title: string;
  instructor: string;
  students?: number;
  lessons?: number;
  totalStudents: number;
  totalLessons: number;
  duration: string;
  category: string;
  status: string;
  created: string;
  description: string;
}

export default function AdminCoursesPage() {
  useCommonShortcuts('admin');

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [statusFilter, searchQuery]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const data = await coursesAPI.getAll(params);
      setCourses(data.map((c: any) => ({
        id: c.id,
        title: c.title,
        instructor: c.teacher_name || 'Admin',
        students: c.enrolled_count || 0,
        lessons: c.module_count || 0,
        status: (c.status || 'Active').charAt(0).toUpperCase() + (c.status || 'Active').slice(1),
        created: new Date(c.created_at).toISOString().split('T')[0],
        description: c.description || '',
        category: c.category || 'Uncategorized',
        difficultyLevel: c.difficulty_level || 'Beginner'
      })));
    } catch (err: any) {
      console.error('Failed to fetch courses:', err);
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  const filteredCourses = courses; // Filtering is handled by API

  const handleDelete = async () => {
    if (deletingCourse) {
      try {
        await coursesAPI.delete(deletingCourse.id);
        setCourses(courses.filter(c => c.id !== deletingCourse.id));
        setDeletingCourse(null);
      } catch (err: any) {
        console.error('Failed to delete course:', err);
        setError('Failed to delete course');
      }
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin User" userRole="Administrator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
            <p className="text-gray-600 mt-1">View and manage all platform courses</p>
          </div>
          <AddCourseDialog onSuccess={fetchCourses} />
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
                  placeholder="Search courses by title or instructor..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search courses"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                >
                  All Courses
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('active')}
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === 'draft' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('draft')}
                >
                  Draft
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Courses ({filteredCourses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium max-w-xs">
                      <div className="truncate">{course.title}</div>
                    </TableCell>
                    <TableCell>{course.instructor}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{course.students}</span>
                        <span className="text-xs text-gray-500">enrolled</span>
                      </div>
                    </TableCell>
                    <TableCell>{course.lessons}</TableCell>
                    <TableCell>
                      <Badge variant={course.status === 'Active' ? 'default' : 'secondary'}>
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{course.created}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = `/admin/courses/${course.id}`}
                                aria-label={`View ${course.title}`}
                              >
                                <Eye className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View course details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingCourse(course)}
                                aria-label={`Edit ${course.title}`}
                              >
                                <Edit className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit course</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeletingCourse(course)}
                                aria-label={`Delete ${course.title}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete course</p>
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
      <EditCourseDialog
        course={editingCourse}
        open={!!editingCourse}
        onOpenChange={(open) => !open && setEditingCourse(null)}
        onSave={(updatedCourse) => {
          setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
          fetchCourses();
        }}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deletingCourse}
        onOpenChange={(open) => !open && setDeletingCourse(null)}
        onConfirm={handleDelete}
        title="Delete Course"
        description={`Are you sure you want to delete "${deletingCourse?.title}"? This action cannot be undone and will affect ${deletingCourse?.students} enrolled students.`}
      />
    </DashboardLayout>
  );
}
