'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GraduationCap, AlertCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';

type AccessibilityMode = 'default' | 'blind' | 'deaf';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'teacher',
    schoolId: '',
    disabilityType: '',
    department: '',
    bio: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('accessibilityMode') as AccessibilityMode;
    if (saved) {
      setAccessibilityMode(saved);
    }
  }, []);

  const validateSchoolId = (schoolId: string) => {
    if (!schoolId.toUpperCase().startsWith('BDU')) {
      return 'School ID must start with "BDU"';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.role === 'student') {
      if (!formData.schoolId) {
        newErrors.schoolId = 'School ID is required';
      } else {
        const schoolIdError = validateSchoolId(formData.schoolId);
        if (schoolIdError) newErrors.schoolId = schoolIdError;
      }
      if (!formData.disabilityType) {
        newErrors.disabilityType = 'Please select your disability type';
      }
    } else {
      if (!formData.department) {
        newErrors.department = 'Department is required';
      }
      if (!formData.email.toLowerCase().startsWith('edu')) {
        newErrors.email = 'Teacher email must start with "edu"';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const signupData: any = {
        email: formData.email,
        password: formData.password,
        fullName: formData.name,
        role: formData.role,
      };

      if (formData.role === 'student') {
        signupData.schoolId = formData.schoolId;
        signupData.disabilityType = formData.disabilityType;
      } else {
        signupData.department = formData.department;
        signupData.bio = formData.bio;
      }

      const response = await authAPI.signup(signupData);

      // Log the user in immediately
      login(response.token, response.user);

      // Redirect based on role
      if (formData.role === 'teacher') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors({ email: error.message || 'Failed to create account. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const bgColor = accessibilityMode === 'blind' ? 'bg-black' : 'bg-slate-950';
  const textSize = accessibilityMode === 'blind' ? 'text-xl' : 'text-base';

  if (!mounted) return null;

  return (
    <div className={`min-h-screen ${bgColor} text-white flex flex-col`}>
      <PublicHeader />
      
      <main id="main-content" className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-white/20 overflow-hidden">
          <div className="p-8 lg:p-10">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-10 w-10 text-slate-950" aria-hidden="true" />
                </div>
              </div>
              <h1 className={`${accessibilityMode === 'blind' ? 'text-4xl' : 'text-3xl'} font-bold text-slate-950 mb-2`}>
                Create Your Account
              </h1>
              <p className={`${textSize} text-slate-600`}>
                Join our accessible e-learning platform
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label className={`${textSize} font-semibold text-slate-950`}>I am a *</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="role-student" />
                    <Label htmlFor="role-student" className={`cursor-pointer ${textSize} text-slate-950`}>Student</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="teacher" id="role-teacher" />
                    <Label htmlFor="role-teacher" className={`cursor-pointer ${textSize} text-slate-950`}>Teacher</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className={`${textSize} font-semibold text-slate-950`}>Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={`${textSize} text-slate-950 border-2 border-slate-300 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 rounded-lg px-4 py-3`}
                />
                {errors.name && (
                  <p id="name-error" className={`${textSize} text-red-600 flex items-center gap-2`}>
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className={`${textSize} font-semibold text-slate-950`}>Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`${textSize} text-slate-950 border-2 border-slate-300 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 rounded-lg px-4 py-3`}
                />
                {errors.email && (
                  <p id="email-error" className={`${textSize} text-red-600 flex items-center gap-2`}>
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className={`${textSize} font-semibold text-slate-950`}>Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a strong password"
                  aria-invalid={!!errors.password}
                  className={`${textSize} text-slate-950 border-2 border-slate-300 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 rounded-lg px-4 py-3`}
                />
                {errors.password && (
                  <p className={`${textSize} text-red-600 flex items-center gap-2`}>
                    <AlertCircle className="h-4 w-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className={`${textSize} font-semibold text-slate-950`}>Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter your password"
                  aria-invalid={!!errors.confirmPassword}
                  className={`${textSize} text-slate-950 border-2 border-slate-300 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 rounded-lg px-4 py-3`}
                />
                {errors.confirmPassword && (
                  <p className={`${textSize} text-red-600 flex items-center gap-2`}>
                    <AlertCircle className="h-4 w-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {formData.role === 'student' ? (
                <>
                  {/* School ID */}
                  <div className="space-y-2">
                    <Label htmlFor="schoolId" className={`${textSize} font-semibold text-slate-950`}>School ID *</Label>
                    <Input
                      id="schoolId"
                      value={formData.schoolId}
                      onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                      placeholder="Must start with 'BDU'"
                      aria-invalid={!!errors.schoolId}
                      className={`${textSize} text-slate-950 border-2 border-slate-300 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 rounded-lg px-4 py-3`}
                    />
                    {errors.schoolId && (
                      <p className={`${textSize} text-red-600 flex items-center gap-2`}>
                        <AlertCircle className="h-4 w-4" />
                        {errors.schoolId}
                      </p>
                    )}
                  </div>

                  {/* Disability Type */}
                  <div className="space-y-3">
                    <Label className={`${textSize} font-semibold text-slate-950`}>Disability Type *</Label>
                    <RadioGroup
                      value={formData.disabilityType}
                      onValueChange={(value) => setFormData({ ...formData, disabilityType: value })}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 border-2 border-slate-300 rounded-lg p-4 hover:border-yellow-400 hover:bg-yellow-50 transition-all cursor-pointer focus-within:ring-4 focus-within:ring-yellow-400/20">
                        <RadioGroupItem value="blind" id="blind" />
                        <Label htmlFor="blind" className={`flex-1 cursor-pointer ${textSize} text-slate-950`}>
                          <div className="font-semibold">Blind / Visually Impaired</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 border-2 border-slate-300 rounded-lg p-4 hover:border-yellow-400 hover:bg-yellow-50 transition-all cursor-pointer focus-within:ring-4 focus-within:ring-yellow-400/20">
                        <RadioGroupItem value="deaf" id="deaf" />
                        <Label htmlFor="deaf" className={`flex-1 cursor-pointer ${textSize} text-slate-950`}>
                          <div className="font-semibold">Deaf / Hearing Impaired</div>
                        </Label>
                      </div>
                    </RadioGroup>
                    {errors.disabilityType && (
                      <p className={`${textSize} text-red-600 flex items-center gap-2`}>
                        <AlertCircle className="h-4 w-4" />
                        {errors.disabilityType}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Department */}
                  <div className="space-y-2">
                    <Label htmlFor="department" className={`${textSize} font-semibold text-slate-950`}>Department *</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Computer Science"
                      className={`${textSize} text-slate-950 border-2 border-slate-300 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 rounded-lg px-4 py-3`}
                    />
                    {errors.department && (
                      <p className={`${textSize} text-red-600 flex items-center gap-2`}>
                        <AlertCircle className="h-4 w-4" />
                        {errors.department}
                      </p>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className={`${textSize} font-semibold text-slate-950`}>Bio</Label>
                    <Input
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself"
                      className={`${textSize} text-slate-950 border-2 border-slate-300 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 rounded-lg px-4 py-3`}
                    />
                  </div>
                </>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className={`w-full ${textSize} bg-yellow-400 text-slate-950 hover:bg-yellow-300 focus:ring-4 focus:ring-yellow-400 font-bold py-3 rounded-lg transition-all ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
                aria-label={isSubmitting ? 'Creating account, please wait' : 'Create your account'}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>

              {/* Login Link */}
              <p className={`text-center ${textSize} text-slate-600 pt-2`}>
                Already have an account?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-slate-950 font-semibold hover:text-yellow-600 underline focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
                >
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
