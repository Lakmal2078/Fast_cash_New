import { prisma } from '../../prisma/client';
import { hashPassword, comparePassword } from '../../utils/hash';
import { signToken } from '../../utils/jwt';
import { RegisterDto, LoginDto } from './auth.schemas';
import { auditService } from '../audit/audit.service';

export const authService = {
  async register(dto: RegisterDto, ip?: string) {
    // Check duplicates
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: dto.username },
          { mobileNumber: dto.mobileNumber },
          ...(dto.email ? [{ email: dto.email }] : []),
        ],
      },
    });

    if (existing) {
      if (existing.username === dto.username) {
        throw Object.assign(new Error('Username already taken'), { statusCode: 409, code: 'DUPLICATE_USERNAME' });
      }
      if (existing.mobileNumber === dto.mobileNumber) {
        throw Object.assign(new Error('Mobile number already registered'), { statusCode: 409, code: 'DUPLICATE_MOBILE' });
      }
      throw Object.assign(new Error('Email already registered'), { statusCode: 409, code: 'DUPLICATE_EMAIL' });
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await prisma.user.create({
      data: {
        fullName: dto.fullName,
        mobileNumber: dto.mobileNumber,
        email: dto.email || null,
        username: dto.username,
        passwordHash,
        referralCode: dto.referralCode || null,
        role: 'CUSTOMER',
      },
      select: { id: true, username: true, fullName: true, role: true, mobileNumber: true, email: true, walletBalance: true, createdAt: true },
    });

    await auditService.log({
      actorId: user.id,
      actorRole: 'CUSTOMER',
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      metadata: { username: user.username },
      ipAddress: ip,
    });

    const token = signToken({ userId: user.id, role: user.role, username: user.username });
    return { user, token };
  },

  async login(dto: LoginDto, ip?: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: dto.identifier }, { mobileNumber: dto.identifier }],
        isActive: true,
      },
    });

    if (!user) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
    }

    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
    }

    await auditService.log({
      actorId: user.id,
      actorRole: user.role,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      ipAddress: ip,
    });

    const token = signToken({ userId: user.id, role: user.role, username: user.username });
    return {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        mobileNumber: user.mobileNumber,
        email: user.email,
        walletBalance: user.walletBalance,
      },
      token,
    };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        mobileNumber: true,
        email: true,
        walletBalance: true,
        pendingBalance: true,
        createdAt: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw Object.assign(new Error('User not found'), { statusCode: 404, code: 'USER_NOT_FOUND' });
    }

    return user;
  },
};
