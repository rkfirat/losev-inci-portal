import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z
      .string()
      .min(8, 'Şifre en az 8 karakter olmalıdır')
      .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
      .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
      .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir'),
    firstName: z.string().min(1, 'Ad zorunludur').max(50),
    lastName: z.string().min(1, 'Soyad zorunludur').max(50),
    phone: z.string().max(20).optional(),
    tcKimlikNo: z.string().max(11).optional(),
    school: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    district: z.string().max(100).optional(),
    grade: z.string().max(20).optional(),
    coordinatorName: z.string().max(100).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(1, 'Şifre zorunludur'),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token zorunludur'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token zorunludur'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token zorunludur'),
    password: z
      .string()
      .min(8, 'Şifre en az 8 karakter olmalıdır')
      .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
      .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
      .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    phone: z.string().max(20).nullable().optional(),
    tcKimlikNo: z.string().max(11).nullable().optional(),
    school: z.string().max(200).nullable().optional(),
    city: z.string().max(100).nullable().optional(),
    district: z.string().max(100).nullable().optional(),
    grade: z.string().max(20).nullable().optional(),
    coordinatorName: z.string().max(100).nullable().optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
