// =============================================
// Seed Script — Creates the first Admin (and optional IT staff) accounts
// Run with: npm run seed
// =============================================

import { PrismaClient, Role, Department } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function upsertUser(data: {
  fullName: string;
  employeeId: string;
  department: Department;
  email: string;
  password: string;
  role: Role;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.upsert({
    where: { email: data.email },
    update: {
      fullName: data.fullName,
      role: data.role,
      isActive: true,
    },
    create: {
      fullName: data.fullName,
      employeeId: data.employeeId,
      department: data.department,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    },
  });
  return user;
}

async function main() {
  console.log('Seeding database...');

  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
  const admin = await upsertUser({
    fullName: 'System Administrator',
    employeeId: 'ADMIN-001',
    department: Department.IT_DEPARTMENT,
    email: 'admin@finance.gov.pk',
    password: adminPassword,
    role: Role.ADMIN,
  });

  console.log('Admin account ready:', admin.email);

  if (process.env.SEED_IT_STAFF === 'true') {
    const staffPassword = process.env.SEED_IT_STAFF_PASSWORD || 'Staff@12345';
    const staff = await upsertUser({
      fullName: 'IT Staff User',
      employeeId: 'STAFF-001',
      department: Department.IT_DEPARTMENT,
      email: 'staff@finance.gov.pk',
      password: staffPassword,
      role: Role.IT_STAFF,
    });
    console.log('IT Staff account ready:', staff.email);
  }

  console.log('------------------------------------------');
  console.log('  Admin Email  : admin@finance.gov.pk');
  console.log('  Admin Role   : ADMIN');
  console.log('------------------------------------------');
  console.log('Change these passwords after first login!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
