import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, Shield, Mic, Accessibility } from "lucide-react";

export default function Home() {
  const dashboards = [
    {
      title: "Student Dashboard",
      description: "Access courses, track progress, and take quizzes",
      href: "/student/dashboard",
      icon: GraduationCap,
      color: "bg-blue-500"
    },
    {
      title: "Teacher Dashboard",
      description: "Manage courses, upload lessons, and track student performance",
      href: "/teacher/dashboard",
      icon: Users,
      color: "bg-green-500"
    },
    {
      title: "Admin Dashboard",
      description: "Manage users, courses, and system settings",
      href: "/admin/dashboard",
      icon: Shield,
      color: "bg-purple-500"
    },
  ];

  const features = [
    {
      title: "Speech API Test",
      description: "Test text-to-speech and speech-to-text with video subtitles",
      href: "/speech-test",
      icon: Mic,
    },
    {
      title: "Accessibility Checker",
      description: "Check learning materials for accessibility issues",
      href: "/accessibility-checker",
      icon: Accessibility,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-16 w-16 text-blue-600" aria-hidden="true" />
            <h1 className="text-5xl font-bold text-gray-900">EduAccess</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Accessible E-Learning Management System for Visually and Hearing Impaired Students
          </p>
          
          {/* Auth Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-gray-700">Students</p>
              <div className="flex gap-2">
                <Link href="/auth/login">
                  <Button size="lg" variant="outline">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden sm:block h-12 w-px bg-gray-300" aria-hidden="true" />
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-gray-700">Lecturers</p>
              <div className="flex gap-2">
                <Link href="/auth/teacher-login">
                  <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/teacher-signup">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden sm:block h-12 w-px bg-gray-300" aria-hidden="true" />
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-gray-700">Administrators</p>
              <Link href="/auth/admin-login">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboards Section */}
        <section aria-labelledby="dashboards-heading" className="mb-16">
          <h2 id="dashboards-heading" className="text-3xl font-bold text-center mb-8">
            Choose Your Dashboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {dashboards.map((dashboard) => {
              const Icon = dashboard.icon;
              return (
                <Link key={dashboard.href} href={dashboard.href}>
                  <Card className="h-full hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
                    <CardHeader>
                      <div className={`${dashboard.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                        <Icon className="h-8 w-8 text-white" aria-hidden="true" />
                      </div>
                      <CardTitle className="text-2xl">{dashboard.title}</CardTitle>
                      <CardDescription className="text-base">
                        {dashboard.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" size="lg">
                        Enter Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Features Section */}
        <section aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-3xl font-bold text-center mb-8">
            Accessibility Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.href} href={feature.href}>
                  <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <Icon className="h-6 w-6 text-gray-700" aria-hidden="true" />
                        </div>
                        <div>
                          <CardTitle>{feature.title}</CardTitle>
                          <CardDescription>{feature.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600">
          <p>Built with accessibility in mind for all learners</p>
        </footer>
      </div>
    </div>
  );
}
