# Quick Reference Card

## 🚀 Start Servers

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

## 🔑 Default Credentials

```
Admin:   admin@eduaccess.com / admin123
Student: Create via signup (requires approval)
Teacher: Create via signup (immediate access)
```

## 📍 URLs

```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
API:      http://localhost:5000/api
```

## 🧪 Quick Test

```bash
# Test backend health
curl http://localhost:5000

# Test admin login
curl -X POST http://localhost:5000/api/auth/login/admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eduaccess.com","password":"admin123"}'
```

## 📊 Integration Status

- ✅ Backend: 100%
- ✅ API Client: 100%
- ✅ Auth Context: 100%
- ⏳ Auth Pages: 40%
- ⏳ Dashboards: 0%
- **Overall: 28%**

## 🔐 Validation Rules

```
Student:
- School ID must start with "BDU"
- Requires admin approval
- Password min 6 characters

Teacher:
- Email must start with "edu"
- Immediate access
- Password min 6 characters

Admin:
- Pre-created accounts only
```

## 🗄️ Database

```bash
# Connect
psql -U eduaccess_user -d e_learning_db

# Reset
cd backend && npm run setup-db

# View users
SELECT id, email, role, approval_status FROM users;
```

## 📝 Common Tasks

### Create Test Student
1. Go to /auth/signup
2. Fill form (schoolId: BDU12345)
3. Login as admin
4. Approve student
5. Login as student

### Create Test Teacher
1. Go to /auth/teacher-signup
2. Fill form (email: eduteacher@test.com)
3. Auto-logged in

### Test API
```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login/admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eduaccess.com","password":"admin123"}' \
  | jq -r '.token')

# Use token
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

## 🐛 Troubleshooting

```bash
# Backend not starting
sudo systemctl start postgresql
cd backend && npm install

# Frontend not starting
cd frontend && npm install
rm -rf .next

# Database error
dropdb e_learning_db
createdb e_learning_db
cd backend && npm run setup-db

# Port in use
lsof -i :5000  # Find process
kill -9 <PID>  # Kill it
```

## 📚 Key Files

```
Frontend:
- lib/api.ts              # API client
- lib/auth-context.tsx    # Auth state
- lib/route-guard.tsx     # Route protection
- .env.local              # Config

Backend:
- routes/*.js             # API routes
- middleware/auth.js      # JWT auth
- schema.sql              # Database
- .env                    # Config
```

## ⌨️ Shortcuts

```
Student: Alt+D/C/P/Q/F
Teacher: Alt+D/C/U/P/A
Admin:   Alt+D/U/C/A/F/S
```

## 🎯 Next Steps

1. ✅ Backend complete
2. ✅ API client ready
3. ⏳ Finish auth pages (3 remaining)
4. ⏳ Add route guards (17 pages)
5. ⏳ Integrate dashboards (17 pages)
6. ⏳ Test workflows
7. ⏳ Production prep

## 📖 Documentation

- `PROJECT_SUMMARY.md` - Complete overview
- `INTEGRATION_STATUS.md` - Current progress
- `INTEGRATION_TESTING_GUIDE.md` - How to test
- `PRODUCTION_READINESS.md` - Production checklist
- `backend/README.md` - API docs
- `backend/API_TESTING.md` - API testing

## 💡 Tips

- Use browser DevTools Network tab to debug API calls
- Check backend terminal for error logs
- Use `console.log(user)` to debug auth state
- Clear localStorage if auth issues
- Test in incognito to avoid cache issues

## ⚠️ Important

- Change JWT_SECRET before production
- Change admin password before production
- Enable HTTPS for production
- Set up monitoring before production
- Test thoroughly before production
