'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RouteGuard } from '@/lib/route-guard';
import { DashboardLayout } from '@/components/dashboard-layout-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeyboardShortcutsHelp } from '@/components/keyboard-shortcuts-help';
import { quizzesAPI, getStoredUser } from '@/lib/api';
import {
  Award,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RotateCcw,
  Home,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function QuizResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const score = parseInt(searchParams.get('score') || '0');
  const correct = parseInt(searchParams.get('correct') || '0');
  const total = parseInt(searchParams.get('total') || '10');
  const quizId = searchParams.get('quizId');

  const [user, setUser] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const storedUser = getStoredUser();
      setUser(storedUser);

      if (quizId) {
        const quizData = await quizzesAPI.getById(parseInt(quizId));
        setQuiz(quizData);
      }
    } catch (err) {
      console.error('Failed to fetch quiz details:', err);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const passed = score >= (quiz?.passing_score || 70);
  const incorrect = total - correct;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'h':
            e.preventDefault();
            router.push('/student/dashboard');
            break;
          case 'c':
            e.preventDefault();
            router.push('/student/courses');
            break;
          case 'p':
            e.preventDefault();
            router.push('/student/progress');
            break;
        }
      }

      // R to retake quiz
      if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        router.push(`/student/quiz?id=${quizId}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, quizId]);

  const keyboardShortcuts = [
    { keys: ['Ctrl', 'H'], description: 'Go to Dashboard' },
    { keys: ['Ctrl', 'C'], description: 'Go to Courses' },
    { keys: ['Ctrl', 'P'], description: 'Go to Progress' },
    { keys: ['R'], description: 'Retake quiz' },
  ];

  return (
    <RouteGuard allowedRoles={['student']}>
      <DashboardLayout role="student" userName={user?.fullName || "Student"} userRole="Student">
        <KeyboardShortcutsHelp shortcuts={keyboardShortcuts} />
        <div className="space-y-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="space-y-2">
                <Badge className="bg-blue-100 text-blue-700 border-0">{quiz?.category || 'Quiz'}</Badge>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Quiz Results</h1>
                <p className="text-lg text-gray-500">{quiz?.title || 'Course Quiz'}</p>
              </div>

              {/* Score Card */}
              <Card className={`border-0 shadow-lg ${passed ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-orange-50 to-orange-100'}`}>
                <CardContent className="pt-8 pb-8">
                  <div className="text-center space-y-6">
                    <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full ${passed ? 'bg-green-500' : 'bg-orange-500'
                      }`}>
                      {passed ? (
                        <CheckCircle2 className="h-14 w-14 text-white" aria-hidden="true" />
                      ) : (
                        <XCircle className="h-14 w-14 text-white" aria-hidden="true" />
                      )}
                    </div>
                    <div>
                      <h2 className={`text-6xl font-bold ${passed ? 'text-green-700' : 'text-orange-700'}`}>
                        {score}%
                      </h2>
                      <p className={`text-xl font-semibold mt-3 ${passed ? 'text-green-800' : 'text-orange-800'}`}>
                        {passed ? 'Congratulations! You Passed!' : 'Keep Practicing!'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-500 p-3 rounded-xl">
                        <Award className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Questions</p>
                        <p className="text-3xl font-bold text-gray-900">{total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-500 p-3 rounded-xl">
                        <CheckCircle2 className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Correct Answers</p>
                        <p className="text-3xl font-bold text-green-700">{correct}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-red-500 p-3 rounded-xl">
                        <XCircle className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Incorrect Answers</p>
                        <p className="text-3xl font-bold text-red-700">{incorrect}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Feedback */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <TrendingUp className="h-6 w-6" aria-hidden="true" />
                    Performance Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {score >= 90 && (
                      <p className="text-gray-700 leading-relaxed">
                        Excellent work! You have a strong understanding of CSS fundamentals.
                        You're ready to move on to more advanced topics.
                      </p>
                    )}
                    {score >= 70 && score < 90 && (
                      <p className="text-gray-700 leading-relaxed">
                        Good job! You have a solid grasp of CSS basics.
                        Review the questions you missed to strengthen your knowledge.
                      </p>
                    )}
                    {score >= 50 && score < 70 && (
                      <p className="text-gray-700 leading-relaxed">
                        You're making progress, but need more practice.
                        Review the course materials and try the quiz again to improve your score.
                      </p>
                    )}
                    {score < 50 && (
                      <p className="text-gray-700 leading-relaxed">
                        Keep learning! Review the course materials carefully and practice more.
                        Don't hesitate to ask your instructor for help.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push(`/student/quiz?id=${quizId}`)}
                  className="gap-2"
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Retake Quiz
                </Button>
                <Link href="/student/dashboard" className="flex-1">
                  <Button className="w-full gap-2" size="lg">
                    <Home className="h-4 w-4" aria-hidden="true" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
