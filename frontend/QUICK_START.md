# Quick Start Guide

## Installation & Setup

```bash
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:3000`

## Dashboard Access

### From Landing Page
Click on any dashboard card:
- **Student Dashboard** → `/dashboard`
- **Teacher Dashboard** → `/teacher/dashboard`  
- **Admin Dashboard** → `/admin/dashboard`

## Quick Navigation

### Student Portal
```
/dashboard          → Main dashboard with stats and courses
/courses            → Browse all available courses
/course/1           → View specific course with video player
/progress           → Track learning progress
/quiz               → Take quizzes
```

### Teacher Portal
```
/teacher/dashboard  → Overview of courses and students
/teacher/courses    → Manage your courses
/teacher/upload     → Upload new lessons
```

### Admin Portal
```
/admin/dashboard    → System overview
/admin/users        → Manage all users
/admin/courses      → Manage all courses
```

## Key Features

✅ Fully responsive design
✅ Accessible for screen readers
✅ Keyboard navigation
✅ High contrast support
✅ Clean, modern UI
✅ No authentication required (demo mode)

## Components Used

- Card, Button, Input, Table
- Dialog, Dropdown Menu, Badge
- Progress, Textarea, Select
- Tabs, Avatar, Label, Radio Group

## Accessibility Features

- Semantic HTML (`<nav>`, `<main>`, `<section>`)
- ARIA labels and roles
- Keyboard focus indicators
- Screen reader announcements
- High contrast text
- Large touch targets

## Demo Data

All dashboards use static demo data:
- 6 sample courses
- 8 sample users
- Progress statistics
- Quiz questions
- Activity feeds

## Customization

Edit these files to customize:
- `components/sidebar.tsx` - Navigation links
- `components/navbar.tsx` - Top bar
- `app/globals.css` - Global styles
- `tailwind.config.ts` - Theme colors

## Troubleshooting

**Port already in use?**
```bash
npm run dev -- -p 3001
```

**Missing components?**
```bash
npx shadcn@latest add [component-name]
```

**Build errors?**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

## Next Steps

1. Explore all three dashboards
2. Test keyboard navigation (Tab, Enter, Escape)
3. Try with a screen reader
4. Check responsive design (mobile/tablet)
5. Review accessibility features

## Support

For issues or questions, check:
- `DASHBOARD_README.md` - Full documentation
- shadcn/ui docs - https://ui.shadcn.com
- Next.js docs - https://nextjs.org/docs
