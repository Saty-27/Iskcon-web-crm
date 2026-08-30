import { pool } from "./db";
import { hashPassword } from "./auth/rbac";

export async function initializeRbacDatabase() {
  try {
    // 1. Add permissions and timestamps columns to users table if they don't exist
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    `);

    // 2. Create audit_logs table and indexes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        user_name TEXT,
        user_role TEXT,
        action TEXT NOT NULL,
        section TEXT NOT NULL,
        target_id TEXT,
        details JSONB,
        ip_address TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_section ON audit_logs(section);
    `);

    // 3. Migrate and secure Super Admin account (isk_conjuhuadmin)
    const adminCheck = await pool.query(`SELECT id, role, password, permissions FROM users WHERE username = 'isk_conjuhuadmin' LIMIT 1`);
    
    if (adminCheck.rows.length > 0) {
      const admin = adminCheck.rows[0];
      let newPasswordHash = admin.password;

      // Hash plain password if not yet hashed
      if (!admin.password.startsWith('$2a$') && !admin.password.startsWith('$2b$') && !admin.password.startsWith('pbkdf2$')) {
        newPasswordHash = await hashPassword(admin.password);
      }

      await pool.query(`
        UPDATE users 
        SET role = 'super_admin', 
            password = $1, 
            permissions = $2::jsonb,
            is_active = true,
            updated_at = NOW()
        WHERE id = $3
      `, [newPasswordHash, JSON.stringify(['*']), admin.id]);

      console.log('✓ Super Admin account (isk_conjuhuadmin) verified and secured with role = super_admin');
    } else {
      // Create initial Super Admin if not present
      const hashedPassword = await hashPassword("isk_conjuhukrishnaconsiousness");

      await pool.query(`
        INSERT INTO users (username, password, email, name, role, permissions, is_active)
        VALUES ('isk_conjuhuadmin', $1, 'admin@iskconjuhu.org', 'ISKCON Juhu Super Admin', 'super_admin', $2::jsonb, true)
        ON CONFLICT (username) DO NOTHING;
      `, [hashedPassword, JSON.stringify(['*'])]);

      console.log('✓ Initial Super Admin account created with bcrypt security');
    }

    console.log('✓ RBAC Database tables, columns, and Super Admin verified successfully');
  } catch (error) {
    console.error('Error initializing RBAC database:', error);
  }
}
