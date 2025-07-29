import DOMPurify from 'dompurify';
import { z } from 'zod';

// HTML sanitization function
export const sanitizeHtml = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
};

// Input validation schemas
export const storySchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  content: z.string()
    .min(1, 'Content is required')
    .max(100000, 'Content must be less than 100,000 characters'),
  author: z.string()
    .min(1, 'Author is required')
    .max(100, 'Author name must be less than 100 characters')
    .trim(),
});

export const vaultSchema = z.object({
  name: z.string()
    .min(1, 'Vault name is required')
    .max(100, 'Vault name must be less than 100 characters')
    .trim(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .transform(val => val?.trim() || ''),
});

export const profileSchema = z.object({
  full_name: z.string()
    .max(100, 'Name must be less than 100 characters')
    .optional()
    .transform(val => val?.trim() || ''),
  email: z.string()
    .email('Invalid email format')
    .optional(),
});

export const emailSchema = z.string()
  .email('Invalid email format')
  .min(1, 'Email is required');

// File validation
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }
  
  return { valid: true };
};

export const validateImageArray = (images: string[]): { valid: boolean; error?: string } => {
  if (images.length > 10) {
    return { valid: false, error: 'Maximum 10 images allowed per story' };
  }
  
  return { valid: true };
};