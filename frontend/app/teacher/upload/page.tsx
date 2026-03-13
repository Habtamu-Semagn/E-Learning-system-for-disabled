'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { coursesAPI, lessonsAPI, getStoredUser } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard-layout-new';
import { KeyboardShortcutsHelp } from '@/components/keyboard-shortcuts-help';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, FileVideo, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function UploadLessonPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    videoUrl: '',
    contentUrl: '',
    durationMinutes: 30,
  });

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    fetchTeacherCourses();
  }, []);

  const fetchTeacherCourses = async () => {
    try {
      setLoadingCourses(true);
      const data = await coursesAPI.getTeacherCourses();
      setCourses(data);
    } catch (err: any) {
      console.error('Failed to fetch courses:', err);
      setError('Failed to load courses. Please refresh the page.');
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId || !formData.title) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setIsUploading(true);
      setError('');

      // Fetch actual lessons for this course to calculate orderIndex
      const existingLessons = await lessonsAPI.getByCourse(parseInt(formData.courseId));
      const orderIndex = existingLessons.length + 1;

      await lessonsAPI.create({
        courseId: parseInt(formData.courseId),
        title: formData.title,
        description: formData.description,
        videoUrl: formData.videoUrl || null,
        content: formData.contentUrl || null,
        orderIndex,
        durationMinutes: formData.durationMinutes
      });

      setSuccess(true);
      setFormData({
        courseId: formData.courseId, // Keep course selected
        title: '',
        description: '',
        videoUrl: '',
        contentUrl: '',
        durationMinutes: 30,
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to upload lesson:', err);
      setError(err.message || 'Failed to publish lesson. Please try again.');
    } finally {
      setIsUploading(false);
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
          case 'a':
            e.preventDefault();
            router.push('/teacher/accessibility');
            break;
          case 's':
            e.preventDefault();
            document.querySelector<HTMLFormElement>('form')?.requestSubmit();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const keyboardShortcuts = [
    { keys: ['Ctrl', 'H'], description: 'Go to Dashboard' },
    { keys: ['Ctrl', 'C'], description: 'Go to Courses' },
    { keys: ['Ctrl', 'A'], description: 'Go to Accessibility' },
    { keys: ['Ctrl', 'S'], description: 'Publish lesson' },
  ];

  return (
    <DashboardLayout role="teacher" userName={user?.fullName || "Teacher"} userRole="Teacher">
      <KeyboardShortcutsHelp shortcuts={keyboardShortcuts} />
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload New Lesson</h1>
          <p className="text-gray-600 mt-1">Add learning materials to your course</p>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your lesson has been published successfully.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course Selection */}
              <div className="space-y-2">
                <Label htmlFor="course-select">Select Course</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(val) => handleInputChange('courseId', val)}
                >
                  <SelectTrigger id="course-select">
                    <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Choose a course"} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lesson Title */}
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Lesson Title</Label>
                <Input
                  id="lesson-title"
                  placeholder="Enter lesson title"
                  aria-required="true"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>

              {/* Video URL (Mocking upload for now) */}
              <div className="space-y-2">
                <Label htmlFor="video-url">Video URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="video-url"
                    placeholder="Enter video URL (e.g., YouTube or S3 link)"
                    value={formData.videoUrl}
                    onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // Mocking an upload/URL generation
                      handleInputChange('videoUrl', `https://storage.example.com/videos/lesson-${Date.now()}.mp4`);
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                    Mock Upload
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  In a production environment, this would be a direct file upload to S3 or similar.
                </p>
              </div>

              {/* PDF Materials (Mocking upload for now) */}
              <div className="space-y-2">
                <Label htmlFor="pdf-url">Supplementary Materials URL (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="pdf-url"
                    placeholder="Enter PDF Materials URL"
                    value={formData.contentUrl}
                    onChange={(e) => handleInputChange('contentUrl', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      handleInputChange('contentUrl', `https://storage.example.com/materials/slides-${Date.now()}.pdf`);
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                    Mock Upload
                  </Button>
                </div>
              </div>

              {/* Lesson Description */}
              <div className="space-y-2">
                <Label htmlFor="lesson-description">Lesson Description</Label>
                <Textarea
                  id="lesson-description"
                  placeholder="Describe what students will learn in this lesson..."
                  rows={6}
                  aria-required="true"
                  required
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => router.push('/teacher/dashboard')}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Lesson'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Upload Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Upload Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-blue-800 text-sm" role="list">
              <li>• Ensure videos have clear audio and are properly captioned for accessibility</li>
              <li>• PDFs should be text-based (not scanned images) for screen reader compatibility</li>
              <li>• Use descriptive titles that clearly indicate the lesson content</li>
              <li>• Include detailed descriptions to help students understand learning objectives</li>
              <li>• Test your materials before publishing to ensure quality</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
