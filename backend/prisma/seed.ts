import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with DEVELOPMENT/DEMO data...');
  console.log('   ⚠️  Replace all demo data before going to production!\n');

  // ── Admin users ──────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 12);

  const superAdmin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      fullName: 'Super Admin',
      mobileNumber: '0700000001',
      username: 'superadmin',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      walletBalance: 0,
    },
  });
  console.log('✅ Super admin created:', superAdmin.username);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      fullName: 'VGS Lakmal (Admin)',
      mobileNumber: '0700000002',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      walletBalance: 0,
    },
  });
  console.log('✅ Admin created:', admin.username);

  // ── Demo customer ────────────────────────────────────────────
  const customerPassword = await bcrypt.hash('Demo@123', 12);
  const demoCustomer = await prisma.user.upsert({
    where: { username: 'demoplayer' },
    update: {},
    create: {
      fullName: 'Demo Player',
      mobileNumber: '0771234567',
      email: 'demo@xbetfastcash.lk',
      username: 'demoplayer',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      walletBalance: 15000,
      pendingBalance: 0,
    },
  });
  console.log('✅ Demo customer created:', demoCustomer.username);

  // ── Payment Accounts (DEMO DATA — replace in production) ─────
  const paymentAccounts = [
    { bankName: 'LOLC Bank', branch: 'Kaluthara', accountNumber: '01210012722', accountHolder: 'VGS LAKMAL', paymentMethod: 'bank', displayOrder: 1 },
    { bankName: 'Peoples Bank', branch: 'Walasmulla', accountNumber: '120200380030196', accountHolder: 'VGS LAKMAL', paymentMethod: 'bank', displayOrder: 2 },
    { bankName: 'Sampath Bank', branch: 'Neluwa', accountNumber: '105456146706', accountHolder: 'NKS OSHADHI', paymentMethod: 'bank', displayOrder: 3 },
    { bankName: 'BOC Bank', branch: 'Walasmulla', accountNumber: '95645895', accountHolder: 'VGS LAKMAL', paymentMethod: 'bank', displayOrder: 4 },
    { bankName: 'iPay', branch: 'Mobile', accountNumber: '0765865387', accountHolder: 'Lakmal', paymentMethod: 'ipay', displayOrder: 5 },
    { bankName: 'iPay', branch: 'Mobile', accountNumber: '0711230791', accountHolder: 'Mahesh', paymentMethod: 'ipay', displayOrder: 6 },
  ];

  for (const acc of paymentAccounts) {
    await prisma.paymentAccount.upsert({
      where: {
        id: (await prisma.paymentAccount.findFirst({
          where: { accountNumber: acc.accountNumber }
        }))?.id || 'new',
      },
      update: {},
      create: acc,
    });
  }
  console.log('✅ Payment accounts seeded (DEMO DATA)');

  // ── Promo Codes ──────────────────────────────────────────────
  await prisma.promoCode.upsert({
    where: { code: 'VGSL' },
    update: {},
    create: {
      code: 'VGSL',
      bonusPercentage: 200,
      description: '200% Welcome Bonus',
      termsConditions: 'New players only. Minimum deposit Rs. 1000.',
      isActive: true,
    },
  });
  console.log('✅ Promo code seeded');

  // ── Ticker Messages ──────────────────────────────────────────
  const tickers = [
    { message: 'Promo Code: VGSL', icon: '🔔', sortOrder: 1 },
    { message: '24/7 Fast Deposit & Withdrawals', icon: '💎', sortOrder: 2 },
    { message: 'Trusted Agent Since 2012', icon: '🏆', sortOrder: 3 },
    { message: '200% Welcome Bonus', icon: '🎁', sortOrder: 4 },
    { message: 'Instant Withdrawals', icon: '⚡', sortOrder: 5 },
  ];

  for (const ticker of tickers) {
    const existing = await prisma.tickerMessage.findFirst({ where: { message: ticker.message } });
    if (!existing) {
      await prisma.tickerMessage.create({ data: ticker });
    }
  }
  console.log('✅ Ticker messages seeded');

  // ── Contact Settings ─────────────────────────────────────────
  const contacts = [
    { name: 'Lakmal', role: 'Agent', phone: '0765865387', whatsapp: '94765865387', sortOrder: 1 },
    { name: 'Mahesh', role: 'Agent', phone: '0711230791', whatsapp: '94711230791', sortOrder: 2 },
  ];

  for (const contact of contacts) {
    const existing = await prisma.contactSetting.findFirst({ where: { phone: contact.phone } });
    if (!existing) {
      await prisma.contactSetting.create({ data: contact });
    }
  }
  console.log('✅ Contact settings seeded');

  // ── System Settings ──────────────────────────────────────────
  const settings = [
    { key: 'site_name', value: 'Xbet Fast Cash', label: 'Site Name', group: 'general' },
    { key: 'min_deposit', value: '500', label: 'Minimum Deposit (Rs.)', group: 'financial' },
    { key: 'max_deposit', value: '500000', label: 'Maximum Deposit (Rs.)', group: 'financial' },
    { key: 'min_withdrawal', value: '1000', label: 'Minimum Withdrawal (Rs.)', group: 'financial' },
    { key: 'max_withdrawal', value: '200000', label: 'Maximum Withdrawal (Rs.)', group: 'financial' },
    { key: 'whatsapp_primary', value: '94711230791', label: 'Primary WhatsApp', group: 'contact' },
    { key: 'whatsapp_secondary', value: '94765865387', label: 'Secondary WhatsApp', group: 'contact' },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('✅ System settings seeded');

  console.log('\n🎉 Seed complete!');
  console.log('\n📝 Default credentials:');
  console.log('   Super Admin: superadmin / Admin@123');
  console.log('   Admin:       admin / Admin@123');
  console.log('   Customer:    demoplayer / Demo@123');
  console.log('\n⚠️  Change all passwords in production!\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
