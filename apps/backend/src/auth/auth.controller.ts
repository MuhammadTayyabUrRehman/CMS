// =============================================
// Auth Controller — Defines All API Routes
// =============================================

import { Body, Controller, Get, Patch, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth') // All routes here start with /api/auth/
export class AuthController {
  constructor(private authService: AuthService) {}

  // -----------------------------------------------
  // POST /api/auth/register
  // Register a new user (anyone can access)
  // Body: { fullName, employeeId, department, email, password, confirmPassword }
  // -----------------------------------------------
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return {
      success: true,
      message: result.message,
      data: result.user,
    };
  }

  // -----------------------------------------------
  // POST /api/auth/login
  // Login and receive JWT token
  // Body: { email, password }
  // Returns: { success, message, data: { token, user } }
  // Frontend reads data.user.role to decide where to redirect:
  //   ADMIN    -> /admin/dashboard
  //   IT_STAFF -> /staff/queue
  //   USER     -> /user/dashboard
  // -----------------------------------------------
  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return {
      success: true,
      message: result.message,
      data: {
        token: result.token,
        user: result.user,
      },
    };
  }

  // -----------------------------------------------
  // GET /api/auth/me
  // Get current logged-in user's info
  // Requires: Authorization: Bearer <token> in header
  // -----------------------------------------------
  @Get('me')
  getMe(@Request() req) {
    return this.authService.getMe(req.user.id);
  }

  // -----------------------------------------------
  // PATCH /api/auth/change-password
  // Update the signed-in user's password.
  // Requires: Authorization: Bearer <token> in header (any role)
  // Body: { currentPassword, newPassword, confirmNewPassword }
  // -----------------------------------------------
  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: { id: string },
    @Body() dto: ChangePasswordDto,
  ) {
    const result = await this.authService.changePassword(user.id, dto);
    return {
      success: true,
      message: result.message,
      data: null,
    };
  }

  // -----------------------------------------------
  // POST /api/auth/forgot-password
  // Send password reset email
  // Body: { email }
  // -----------------------------------------------
  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(dto);
    return {
      success: true,
      message: result.message,
      data: null,
    };
  }

  // -----------------------------------------------
  // POST /api/auth/reset-password
  // Set a new password using the reset token from email
  // Body: { token, newPassword }
  // -----------------------------------------------
  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(dto);
    return {
      success: true,
      message: result.message,
      data: null,
    };
  }
}
