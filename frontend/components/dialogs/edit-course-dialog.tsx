'use client';

import { useState, useEffect } from 'react';
import { coursesAPI } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Course {
  id: number;
  title: string;
  instructor: string;
  status: string;
  description: string;
  created: string;
  totalStudents: number;
  totalLessons: number;
  duration: string;
  category: string;
}

interface EditCourseDialogProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (course: Course) => void;
}

export function EditCourseDialog({ course, open, onOpenChange, onSave }: EditCourseDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Active',
  });

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description || '',
        status: course.status,
      });
    }
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    const updatedCourse = {
      ...course,
      ...formData,
    };

    // Call API to update course
    try {
      const apiData = {
        title: formData.title,
        description: formData.description,
        status: formData.status.toLowerCase(), // Backend expects lowercase
      };

      const response = await coursesAPI.update(course.id, apiData);

      if (onSave) {
        onSave({
          ...updatedCourse,
          title: response.title,
          description: response.description,
          status: response.status.charAt(0).toUpperCase() + response.status.slice(1),
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update course:', error);
      // Optional: show error message to user
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Make changes to the course. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-course-title">Course Title</Label>
              <Input
                id="edit-course-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-course-description">Description</Label>
              <Textarea
                id="edit-course-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-course-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="edit-course-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
