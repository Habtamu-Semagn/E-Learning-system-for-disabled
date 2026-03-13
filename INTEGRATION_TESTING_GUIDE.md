# Integration Testing Guide

## Prerequisites

1. PostgreSQL installed and running
2. Node.js installed
3. Both backend and frontend dependencies installed

## Setup Steps

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create database
createdb e_learning_db
createuser eduaccess_user -P
# Enter password: postgresql

# Grant privileges
psql -U postgres
GRANT ALL PRIVILEGES ON DATABASE e_learning_db TO eduaccess_user;
\q

# Initialize database
npm run setup-db

# Start backend server
npm run dev
```

Expected output:
```
Connected to PostgreSQL database
Server running on port 5000
```

### 2. Frontend Setup

```bash
# Navigate to frontend (in new terminal)
cd frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

Expected output:
```
Ready on http://localhost:3000
```

## Testing Workflows

### Test 1: Student Registration & Approval Flow

#### Step 1: Student Signup
1. Open http://localhost:3000
2. Click "Sign up here"
3. Fill in the form:
   - Name: Test Student
   - Email: student@test.com
   - School ID: BDU12345
   - Password: test123
   - Confirm Password: test123
   - Disability Type: Select one
4. Click "Create Account"
5. Should redirect to pending approval page

#### Step 2: Verify in Database
```bash
psql -U eduaccess_user -d e_learning_db
SELECT id, email, full_name, approval_status FROM users WHERE role='student';
```

Expected: Student with 'pending' status

#### Step 3: Try to Login (Should Fail)
1. Go to http://localhost:3000/auth/login
2. Enter student@test.com / test123
3. Should redirect to pending page or show error

#### Step 4: Admin Approval
1. Go to http://localhost:3000/auth/admin-login
2. Login with:
   - Email: admin@eduaccess.com
   - Password: admin123
3. Navigate to Approvals page
4. Find the pending student
5. Click "Approve"

#### Step 5: Student Login (Should Work)
1. Go to http://localhost:3000/auth/login
2. Enter student@test.com / test123
3. Should redirect to /student/dashboard
4. Verify user is logged in

### Test 2: Teacher Registration & Login

#### Step 1: Teacher Signup
1. Go to http://localhost:3000/auth/teacher-signup
2. Fill in the form:
   - Name: Test Teacher
   - Email: eduteacher@test.com (must start with 'edu')
   - Department: Computer Science
   - Password: test123
   - Bio: (optional)
3. Click "Create Account"
4. Should automatically login and redirect to teacher dashboard

#### Step 2: Verify Teacher Can Create Course
1. Navigate to Courses page
2. Click "Add Course"
3. Fill in course details
4. Save course
5. Verify course appears in list

### Test 3: Course Enrollment Flow

#### Step 1: Teacher Creates Course
1. Login as teacher
2. Create a new course
3. Add lessons to the course
4. Publish the course (change status to 'published')

#### Step 2: Student Enrolls
1. Login as student
2. Go to Courses page
3. Find the published course
4. Click "Enroll"
5. Verify enrollment success

#### Step 3: Student Tracks Progress
1. Open the enrolled course
2. Click on a lesson
3. Mark lesson as complete
4. Verify progress updates

### Test 4: Quiz Flow

#### Step 1: Teacher Creates Quiz
1. Login as teacher
2. Go to course details
3. Create a quiz
4. Add questions and options
5. Save quiz

#### Step 2: Student Takes Quiz
1. Login as student
2. Go to enrolled course
3. Find the quiz
4. Answer questions
5. Submit quiz
6. View results

### Test 5: Feedback System

#### Step 1: Student Submits Feedback
1. Login as student
2. Navigate to feedback/profile page
3. Submit feedback with:
   - Category: Course Content
   - Subject: Test Feedback
   - Message: This is a test
   - Priority: Medium
4. Verify submission

#### Step 2: Admin Reviews Feedback
1. Login as admin
2. Go to Feedback page
3. Find the submitted feedback
4. Update status to "In Progress"
5. Add admin response
6. Save changes

### Test 6: Admin User Management

#### Step 1: View All Users
1. Login as admin
2. Go to Users page
3. Verify all users are listed
4. Filter by role

#### Step 2: Create New User
1. Click "Add User"
2. Fill in details
3. Save user
4. Verify user appears in list

#### Step 3: Edit User
1. Click on a user
2. Edit details
3. Save changes
4. Verify changes

### Test 7: Audit Logs

#### Step 1: Perform Actions
1. Login as admin
2. Approve a student
3. Create a user
4. Update feedback

#### Step 2: View Audit Logs
1. Go to System/Audit page
2. Verify all actions are logged
3. Filter by action type
4. Verify details are correct

## API Testing with curl

### Test Authentication

```bash
# Student Login
curl -X POST http://localhost:5000/api/auth/login/student \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"test123"}'

# Save the token from response
TOKEN="your_token_here"

# Test Protected Endpoint
curl http://localhost:5000/api/courses \
  -H "Authorization: Bearer $TOKEN"
```

### Test Course Creation

```bash
# Login as teacher first
curl -X POST http://localhost:5000/api/auth/login/teacher \
  -H "Content-Type: application/json" \
  -d '{"email":"eduteacher@test.com","password":"test123"}'

# Use teacher token
TEACHER_TOKEN="teacher_token_here"

# Create course
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Test Course",
    "description":"Test Description",
    "category":"Programming",
    "difficultyLevel":"beginner"
  }'
```

## Common Issues & Solutions

### Issue 1: Database Connection Error
**Error**: "Connection refused"
**Solution**:
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql

# Verify connection
psql -U eduaccess_user -d e_learning_db
```

### Issue 2: Port Already in Use
**Error**: "Port 5000 already in use"
**Solution**:
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Issue 3: CORS Error
**Error**: "CORS policy blocked"
**Solution**:
- Verify backend CORS is configured
- Check frontend is using correct API URL
- Ensure both servers are running

### Issue 4: Token Invalid
**Error**: "Invalid or expired token"
**Solution**:
- Logout and login again
- Clear localStorage
- Check JWT_SECRET matches between requests

### Issue 5: School ID Validation Fails
**Error**: "School ID must start with BDU"
**Solution**:
- Ensure school ID starts with "BDU" (case-insensitive)
- Example: BDU12345, bdu12345

### Issue 6: Teacher Email Validation Fails
**Error**: "Teacher email must start with edu"
**Solution**:
- Ensure email starts with "edu"
- Example: eduteacher@test.com

## Verification Checklist

After testing, verify:

- [ ] Student can signup and wait for approval
- [ ] Admin can approve/reject students
- [ ] Approved students can login
- [ ] Teacher can signup and login immediately
- [ ] Admin can login
- [ ] Protected routes redirect unauthorized users
- [ ] Teacher can create courses
- [ ] Teacher can add lessons
- [ ] Student can enroll in courses
- [ ] Student can track progress
- [ ] Student can take quizzes
- [ ] Student can submit feedback
- [ ] Admin can manage users
- [ ] Admin can view feedback
- [ ] Admin can view audit logs
- [ ] Logout works correctly
- [ ] Token persists across page refreshes
- [ ] Error messages are clear
- [ ] Loading states work
- [ ] All keyboard shortcuts work

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test login endpoint
ab -n 1000 -c 10 -p login.json -T application/json \
  http://localhost:5000/api/auth/login/student

# Test courses endpoint (with auth)
ab -n 1000 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/courses
```

### Expected Performance
- Login: < 200ms
- Get courses: < 100ms
- Create course: < 300ms
- Enroll: < 200ms

## Security Testing

### Test Rate Limiting
```bash
# Send many requests quickly
for i in {1..200}; do
  curl http://localhost:5000/api/auth/login/student \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}' &
done
```

Should see rate limit errors after threshold.

### Test SQL Injection
Try entering SQL in form fields:
```
' OR '1'='1
'; DROP TABLE users; --
```

Should be prevented by parameterized queries.

### Test XSS
Try entering scripts:
```
<script>alert('XSS')</script>
```

Should be sanitized.

## Next Steps

After successful testing:
1. Fix any bugs found
2. Complete remaining page integrations
3. Add comprehensive error handling
4. Implement production security measures
5. Set up monitoring
6. Prepare for deployment
