import { db } from './server/storage.js';
import { users } from './shared/schema.js';
import crypto from 'crypto';

async function createAdmin() {
  // Hash password: isk_conjuhukrishnaconsiousness
  const password = 'isk_conjuhukrishnaconsiousness';
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  
  try {
    await db.insert(users).values({
      username: 'isk_conjuhuadmin',
      email: 'admin@iskconjuhu.org',
      password: hashedPassword,
      name: 'ISKCON Juhu Admin',
      role: 'admin',
      isActive: true
    });
    
    console.log('✅ Default admin user created successfully!');
    console.log('Username: isk_conjuhuadmin');
    console.log('Password: isk_conjuhukrishnaconsiousness');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
