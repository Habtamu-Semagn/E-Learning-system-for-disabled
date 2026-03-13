# Accessible E-Learning Management System - Frontend Dashboards

## Overview
Complete frontend dashboard system for an accessible e-learning platform designed for visually impaired and hearing-impaired university students.

## Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: lucide-react

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx                          # Landing page with dashboard selection
│   ├── layout.tsx                        # Root layout
│   │
│   ├── dashboard/                        # Student Dashboard
│   │   └── page.tsx
│   ├── courses/                          # Student Courses Page
│   │   └── page.tsx
│   ├── course/[id]/                      # Course Detail Page
│   │   └── page.tsx
│   ├── progress/                         # Student Progress Page
│   │   └── page.tsx
│   ├── quiz/                             # Quiz Page
│   │   └── page.tsx
│   │
│   ├── teacher/                          # Teacher Pages
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── courses/
│   │   │   └── page.tsx
│   │   └── upload/
│   │       └── page.tsx
│   │
│   └── admin/                            # Admin Pages
│       ├── dashboard/
│       │   └── page.tsx
│       ├── users/
│       │   └── page.tsx
│       └── courses/
│           └── page.tsx
│
└── components/
    ├── dashboard-layout.tsx              # Reusable dashboard layout
    ├── sidebar.tsx                       # Navigation sidebar
    ├── navbar.tsx                        # Top navigation bar
    ├── course-card.tsx                   # Course display card
    ├── progress-card.tsx                 # Progress statistics card
    ├── video-player.tsx                  # Accessible video player
    ├── quiz-card.tsx                     # Quiz question card
    └── ui/                               # shadcn/ui components
```

## Features

### Student Dashboard
- Welcome message and statistics
- Enrolled courses display
- Course progress tracking
- Recent activity feed
- Quiz scores and learning hours

### Teacher Dashboard
- Course management
- Student enrollment tracking
- Lesson upload interface
- Performance analytics

### Admin Dashboard
- User management (students, teachers)
- Course management
- System statistics
- Platform oversight

## Accessibility Features

All dashboards include:
- ✅ Semantic HTML structure
- ✅ ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ High contrast text
- ✅ Large clickable buttons
- ✅ Screen reader friendly
- ✅ Focus indicators
- ✅ Descriptive alt text

## Getting Started

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```

Visit `http://localhost:3000` to see the landing page.

## Available Routes

### Student Routes
- `/` - Landing page
- `/dashboard` - Student dashboard
- `/courses` - All courses
- `/course/[id]` - Course detail page
- `/progress` - Learning progress
- `/quiz` - Quiz interface

### Teacher Routes
- `/teacher/dashboard` - Teacher dashboard
- `/teacher/courses` - Manage courses
- `/teacher/upload` - Upload lessons

### Admin Routes
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - Manage users
- `/admin/courses` - Manage courses

## Components

### DashboardLayout
Reusable layout with sidebar and navbar.
```tsx
<DashboardLayout role="student" userName="John Doe" userRole="Student">
  {children}
</DashboardLayout>
```

### CourseCard
Display course information with progress.
```tsx
<CourseCard
  id="1"
  title="Web Development"
  instructor="Dr. Smith"
  progress={65}
  lessons={12}
/>
```

### ProgressCard
Show statistics with progress bars.
```tsx
<ProgressCard
  title="Courses Completed"
  value={3}
  total={6}
  icon={BookOpen}
  color="blue"
/>
```

### VideoPlayer
Accessible video player with controls.
```tsx
<VideoPlayer
  src="/video.mp4"
  title="Lesson 1: Introduction"
/>
```

### QuizCard
Interactive quiz interface.
```tsx
<QuizCard
  question="What is React?"
  options={["Library", "Framework", "Language", "Tool"]}
  questionNumber={1}
  totalQuestions={10}
/>
```

## Customization

### Colors
Modify `tailwind.config.ts` to change the color scheme.

### Components
All shadcn/ui components can be customized in `components/ui/`.

### Layout
Adjust sidebar navigation in `components/sidebar.tsx`.

## Notes

- No authentication implemented (UI only)
- No backend API calls (static data)
- No database integration
- Focus on UI/UX and accessibility
- Ready for backend integration

## Next Steps

To make this production-ready:
1. Implement authentication (NextAuth.js)
2. Connect to backend API
3. Add database integration
4. Implement real-time features
5. Add comprehensive testing
6. Deploy to production

## Accessibility Testing

Test with:
- Screen readers (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- High contrast mode
- Browser zoom (200%+)
- Color blindness simulators

## License
MIT
