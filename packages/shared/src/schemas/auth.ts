import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Valid email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface AdminUser {
  id: string;
  email: string;
}
