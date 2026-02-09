import { Request, Response } from 'express';
import { authService } from './auth.service';
import { apiResponse } from '@common/utils/apiResponse';
import { asyncHandler } from '@common/utils/asyncHandler';
import type { RegisterInput, LoginInput, ChangePasswordInput } from './auth.validation';

/**
 * Auth Controller — HTTP orchestration layer.
 *
 * Single Responsibility: extract data from request, call service, shape response.
 * Contains NO business logic.
 */
class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.register(req.body as RegisterInput);
    apiResponse.created(res, result, 'User registered successfully');
  });

  /**
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.login(req.body as LoginInput);
    apiResponse.success(res, result, 'Login successful');
  });

  /**
   * GET /api/v1/auth/me
   */
  getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const profile = await authService.getProfile(userId);
    apiResponse.success(res, profile, 'Profile retrieved successfully');
  });

  /**
   * PATCH /api/v1/auth/change-password
   */
  changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    await authService.changePassword(userId, req.body as ChangePasswordInput);
    apiResponse.success(res, null, 'Password changed successfully');
  });
}

export const authController = new AuthController();
