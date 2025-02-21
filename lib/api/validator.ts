import { z } from 'zod';
import { ApiError } from './response';

export type ValidationSchema = z.ZodType<any, any>;

export async function validateRequest<T extends ValidationSchema>(
    schema: T,
    data: any
): Promise<z.infer<T>> {
    try {
        return await schema.parseAsync(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new ApiError(
                'VALIDATION_ERROR',
                'Invalid request data',
                400,
                error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message,
                }))
            );
        }
        throw error;
    }
}

export const commonSchemas = {
    objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
};