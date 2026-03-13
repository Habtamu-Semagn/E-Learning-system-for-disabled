'use client';

import { useState, useEffect } from 'react';
import { lessonsAPI } from '@/lib/api';
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
import { Loader2 } from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  duration: string;
  order: number;
  description?: string;
}

interface EditLessonDialogProps {
  lesson: Lesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (lesson: Lesson) => void;
}

export function EditLessonDialog({ lesson, open, onOpenChange, onSave }: EditLessonDialogProps) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [order, setOrder] = useState(1);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
      setDuration(lesson.duration.toString());
      setOrder(lesson.order);
      setDescription(lesson.description || '');
    }
  }, [lesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson) return;

    setIsSubmitting(true);
    setError('');

    try {
      const data = await lessonsAPI.update(lesson.id, {
        title,
        description,
        orderIndex: order,
        durationMinutes: parseInt(duration) || 0,
      });

      onSave({
        id: data.id,
        title: data.title,
        duration: data.duration_minutes?.toString() || '0',
        order: data.order_index,
        description: data.description || '',
      });

      console.log('Lesson updated:', data);
      onOpenChange(false);
    } catch (err: any) {
      console.error('Failed to update lesson:', err);
      setError(err.message || 'Failed to update lesson');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
            <DialogDescription>
              Update the lesson details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm font-medium text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Lesson Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to React Hooks"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-duration">Duration (minutes) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 30"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-order">Order *</Label>
                <Input
                  id="edit-order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value))}
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the lesson content..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
