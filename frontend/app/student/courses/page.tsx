'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/lib/route-guard';
import { DashboardLayout } from '@/components/dashboard-layout-new';
import { CourseCard } from '@/components/course-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyboardShortcutsHelp } from '@/components/keyboard-shortcuts-help';
import { coursesAPI, enrollmentsAPI, getStoredUser } from '@/lib/api';
import { Search, Filter, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<number[]>([]);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const storedUser = getStoredUser();
      setUser(storedUser);

      // Fetch all published courses and student's enrollments in parallel
      const [allCourses, studentEnrollments] = await Promise.all([
        coursesAPI.getAll({ status: 'published' }),
        storedUser ? enrollmentsAPI.getByStudent(storedUser.id) : Promise.resolve([])
      ]);

      setCourses(allCourses);
      setMyEnrollments(studentEnrollments.map((e: any) => e.course_id));
    } catch (err: any) {
      console.error('Failed to fetch courses:', err);
      setError(err.message || 'Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);


  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.teacher_name && course.teacher_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Navigation shortcuts (Ctrl+Key)
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'h':
            e.preventDefault();
            router.push('/student/dashboard');
            break;
          case 'p':
            e.preventDefault();
            router.push('/student/progress');
            break;
          case 'q':
            e.preventDefault();
            router.push('/student/quiz');
            break;
          case 'f':
            e.preventDefault();
            document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
            break;
        }
      }

      // Number shortcuts for quick course access (1-9)
      if (!e.ctrlKey && !e.altKey && !e.shiftKey && /^[1-9]$/.test(e.key)) {
        const courseIndex = parseInt(e.key) - 1;
        if (courseIndex < filteredCourses.length) {
          e.preventDefault();
          router.push(`/student/course/${filteredCourses[courseIndex].id}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, filteredCourses]);

  const keyboardShortcuts = [
    { keys: ['Ctrl', 'H'], description: 'Go to Dashboard' },
    { keys: ['Ctrl', 'P'], description: 'Go to Progress' },
    { keys: ['Ctrl', 'Q'], description: 'Go to Quiz' },
    { keys: ['Ctrl', 'F'], description: 'Focus search' },
    { keys: ['1-9'], description: 'Open course (quick access)' },
  ];

  return (
    <RouteGuard allowedRoles={['student']}>
      <DashboardLayout role="student" userName={user?.fullName || "Student"} userRole="Student">
        <KeyboardShortcutsHelp shortcuts={keyboardShortcuts} />
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">All Courses</h1>
            <p className="text-lg text-gray-500">Explore and enroll in available courses</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
          ) : (
            <>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <Input
                    type="search"
                    placeholder="Search courses..."
                    className="pl-10 h-11"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search courses"
                  />
                </div>
                <Button variant="outline" className="gap-2 h-11">
                  <Filter className="h-4 w-4" aria-hidden="true" />
                  Filter
                </Button>
              </div>

              {/* Courses Grid */}
              <section aria-label="Available courses">
                {filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => {
                      const isEnrolled = myEnrollments.includes(course.id);
                      return (
                        <div key={course.id} className="relative">
                          <CourseCard
                            id={course.id.toString()}
                            title={course.title}
                            instructor={course.teacher_name || 'Instructor'}
                            lessons={course.lessons_count || 0}
                            duration={course.duration || 'Flexible'}
                            enrolled={isEnrolled}
                            onEnrolled={fetchCourses}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No courses found matching your search.</p>
                    <Button
                      variant="link"
                      className="text-blue-600 mt-2"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear search and view all
                    </Button>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
