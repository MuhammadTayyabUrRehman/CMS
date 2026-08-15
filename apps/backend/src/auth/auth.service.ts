// =============================================
// Auth Service — All Business Logic
// register, login, forgot password, reset password
// =============================================

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../database/service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // -----------------------------------------------
  // REGISTER — Create a new user account
  // -----------------------------------------------
  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const emailExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (emailExists) {
      throw new BadRequestException('An account with this email already exists');
    }

    const employeeIdExists = await this.prisma.user.findUnique({
      where: { employeeId: dto.employeeId },
    });
    if (employeeIdExists) {
      throw new BadRequestException('This Employee ID is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        employeeId: dto.employeeId,
        department: dto.department,
        email: dto.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        fullName: true,
        employeeId: true,
        department: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return {
      message: 'Account created successfully. You can now log in.',
      user,
    };
  }

  // -----------------------------------------------
  // LOGIN — Verify credentials & return JWT token
  // -----------------------------------------------
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account has been deactivated. Please contact the IT administrator.',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        employeeId: user.employeeId,
        department: user.department,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  // -----------------------------------------------
  // GET ME — Return current logged-in user's info
  // -----------------------------------------------
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        employeeId: true,
        department: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // -----------------------------------------------
  // CHANGE PASSWORD — Update the current user's password
  // JWT-protected (any authenticated role). Verifies the
  // current password before applying the new one.
  // -----------------------------------------------
  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return {
      message: 'Password updated successfully.',
    };
  }

  // -----------------------------------------------
  // FORGOT PASSWORD — Generate token & send email
  // -----------------------------------------------
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always return success even if email not found (prevents email enumeration).
    if (!user) {
      return {
        message: 'If this email is registered, a reset link has been sent.',
      };
    }

    await this.prisma.passwordReset.deleteMany({
      where: { userId: user.id, used: false },
    });

    const resetToken = crypto.randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    try {
      await this.mailService.sendPasswordResetEmail(user.email, user.fullName, resetToken);
    } catch (error) {
      // Never fail the request because mail delivery failed;
      // log and return success so the user is not exposed to a broken endpoint.
      this.logger.error(`Failed to send password reset email to ${user.email}`, error as any);
    }

    return {
      message: 'A password reset link has been sent to your email address.',
    };
  }

  // -----------------------------------------------
  // RESET PASSWORD — Set a new password using token
  // -----------------------------------------------
  async resetPassword(dto: ResetPasswordDto) {
    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { token: dto.token },
    });

    if (!resetRecord) {
      throw new BadRequestException('Invalid or expired reset link');
    }

    if (resetRecord.used) {
      throw new BadRequestException(
        'This reset link has already been used. Please request a new one.',
      );
    }

    if (new Date() > resetRecord.expiresAt) {
      throw new BadRequestException(
        'This reset link has expired. Please request a new one.',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    return {
      message:
        'Password updated successfully. You can now log in with your new password.',
    };
  }
}
