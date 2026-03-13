'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { systemAPI, coursesAPI, getStoredUser } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard-layout-new';
import { KeyboardShortcutsHelp } from '@/components/keyboard-shortcuts-help';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BookOpen, Users, Upload, TrendingUp, Edit, Eye, Trash2, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EditCourseDialog } from '@/components/dialogs/edit-course-dialog';
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirm-dialog';

interface Course {
  id: number;
  title: string;
  instructor: string;
  students?: number;
  totalStudents: number;
  lessons?: number;
  totalLessons: number;
  duration: string;
  category: string;
  status: string;
  created: string;
  description: string;
  completion?: number;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState([
    { title: 'Total Courses', value: '0', icon: BookOpen, color: 'blue' },
    { title: 'Total Students', value: '0', icon: Users, color: 'green' },
    { title: 'Uploaded Lessons', value: '0', icon: Upload, color: 'purple' },
    { title: 'Avg. Completion', value: '0%', icon: TrendingUp, color: 'orange' },
  ]);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsData, coursesData] = await Promise.all([
        systemAPI.getTeacherStats(),
        coursesAPI.getTeacherCourses()
      ]);

      setStats([
        { title: 'Total Courses', value: statsData.totalCourses.toString(), icon: BookOpen, color: 'blue' },
        { title: 'Total Students', value: statsData.totalStudents.toString(), icon: Users, color: 'green' },
        { title: 'Uploaded Lessons', value: statsData.totalLessons.toString(), icon: Upload, color: 'purple' },
        { title: 'Avg. Completion', value: statsData.avgCompletion, icon: TrendingUp, color: 'orange' },
      ]);

      setCourses(coursesData.map((c: any) => ({
        id: c.id,
        title: c.title,
        students: c.enrollment_count || 0,
        totalStudents: c.enrollment_count || 0,
        lessons: c.lesson_count || 0,
        totalLessons: c.lesson_count || 0,
        completion: Math.round(c.avg_progress || 0),
        instructor: c.teacher_name,
        description: c.description,
        duration: c.duration || '',
        category: c.category,
        created: c.created_at,
        status: c.status
      })));
    } catch (err: any) {
      console.error('Failed to fetch teacher dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = async (updatedCourse: Course) => {
    try {
      await coursesAPI.update(updatedCourse.id, updatedCourse);
      setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    } catch (err: any) {
      console.error('Failed to update course:', err);
      alert('Failed to update course: ' + err.message);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    try {
      await coursesAPI.delete(courseId);
      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err: any) {
      console.error('Failed to delete course:', err);
      alert('Failed to delete course: ' + err.message);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'h':
            e.preventDefault();
            router.push('/teacher/dashboard');
            break;
          case 'c':
            e.preventDefault();
            router.push('/teacher/courses');
            break;
          case 'u':
            e.preventDefault();
            router.push('/teacher/upload');
            break;
          case 'a':
            e.preventDefault();
            router.push('/teacher/accessibility');
            break;
        }
      }

      // Number shortcuts for quick course access (1-4)
      if (!e.ctrlKey && !e.altKey && !e.shiftKey && ['1', '2', '3', '4'].includes(e.key)) {
        const courseIndex = parseInt(e.key) - 1;
        if (courseIndex < courses.length) {
          e.preventDefault();
          setEditingCourse(courses[courseIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, courses]);

  const keyboardShortcuts = [
    { keys: ['Ctrl', 'H'], description: 'Go to Dashboard' },
    { keys: ['Ctrl', 'C'], description: 'Go to Courses' },
    { keys: ['Ctrl', 'U'], description: 'Go to Upload' },
    { keys: ['Ctrl', 'A'], description: 'Go to Accessibility' },
    { keys: ['1-4'], description: 'Edit course (quick access)' },
  ];

  return (
    <DashboardLayout role="teacher" userName={user?.fullName || "Teacher"} userRole="Teacher">
      <KeyboardShortcutsHelp shortcuts={keyboardShortcuts} />
      <div className="space-y-6">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your courses and track student progress</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-700',
              green: 'bg-green-100 text-green-700',
              purple: 'bg-purple-100 text-purple-700',
              orange: 'bg-orange-100 text-orange-700',
            }[stat.color];

            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${colorClasses}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No courses found. Start by uploading your first course.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Students Enrolled</TableHead>
                    <TableHead>Lessons</TableHead>
                    <TableHead>Avg. Completion</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>{course.students}</TableCell>
                      <TableCell>{course.lessons}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${course.completion}%` }}
                              role="progressbar"
                              aria-valuenow={course.completion}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`${course.completion}% completion`}
                            />
                          </div>
                          <span className="text-sm">{course.completion}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
                                  onClick={() => router.push(`/teacher/courses/${course.id}`)}
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
            )}
          </CardContent>
        </Card>

        {/* Edit Course Dialog */}
        {editingCourse && (
          <EditCourseDialog
            course={editingCourse}
            open={!!editingCourse}
            onOpenChange={(open) => !open && setEditingCourse(null)}
            onSave={handleEditCourse}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {deletingCourse && (
          <DeleteConfirmDialog
            open={!!deletingCourse}
            onOpenChange={(open) => !open && setDeletingCourse(null)}
            onConfirm={() => {
              handleDeleteCourse(deletingCourse.id);
              setDeletingCourse(null);
            }}
            title="Delete Course"
            description={`Are you sure you want to delete "${deletingCourse.title}"? This action cannot be undone and will remove all associated lessons and student progress.`}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
