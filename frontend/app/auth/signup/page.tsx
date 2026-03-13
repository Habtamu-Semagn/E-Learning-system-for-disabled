'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GraduationCap, AlertCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
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

      await authAPI.signup(signupData);

      if (formData.role === 'student') {
        router.push('/auth/pending');
      } else {
        router.push('/auth/login?message=Registration successful. Please login.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors({ email: error.message || 'Failed to create account. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-blue-600" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>
            Join our accessible e-learning platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label>I am a *</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="role-student" />
                  <Label htmlFor="role-student" className="cursor-pointer">Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="teacher" id="role-teacher" />
                  <Label htmlFor="role-teacher" className="cursor-pointer">Teacher</Label>
                </div>
              </RadioGroup>
            </div>
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.email}
                </p>
              )}
            </div>

            {formData.role === 'student' ? (
              <>
                {/* School ID */}
                <div className="space-y-2">
                  <Label htmlFor="schoolId">School ID *</Label>
                  <Input
                    id="schoolId"
                    value={formData.schoolId}
                    onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                    placeholder="Must contain 'BDU'"
                    aria-invalid={!!errors.schoolId}
                  />
                  {errors.schoolId && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.schoolId}
                    </p>
                  )}
                </div>

                {/* Disability Type */}
                <div className="space-y-3">
                  <Label>Disability Type *</Label>
                  <RadioGroup
                    value={formData.disabilityType}
                    onValueChange={(value) => setFormData({ ...formData, disabilityType: value })}
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50">
                      <RadioGroupItem value="blind" id="blind" />
                      <Label htmlFor="blind" className="flex-1 cursor-pointer">
                        <div className="font-medium">Blind / Visually Impaired</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50">
                      <RadioGroupItem value="deaf" id="deaf" />
                      <Label htmlFor="deaf" className="flex-1 cursor-pointer">
                        <div className="font-medium">Deaf / Hearing Impaired</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            ) : (
              <>
                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Computer Science"
                  />
                  {errors.department && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.department}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself"
                  />
                </div>
              </>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a strong password"
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter your password"
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Login here
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
