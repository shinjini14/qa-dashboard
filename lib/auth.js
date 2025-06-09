import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../pages/api/utils/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(user) {
  return jwt.sign(
    {
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(username, password) {
  try {
    // First, get user by username only
    const { rows } = await pool.query(
      'SELECT username, password, role FROM login WHERE username = $1',
      [username]
    );

    if (rows.length === 0) {
      return { success: false, message: 'Invalid credentials' };
    }

    const user = rows[0];

    // Check if user has admin role
    if (user.role !== 'admin') {
      return { success: false, message: 'Access denied. Admin role required.' };
    }

    // Check password - handle both hashed and plain text for backward compatibility
    let passwordValid = false;

    if (user.password.startsWith('$2')) {
      // Hashed password
      passwordValid = await verifyPassword(password, user.password);
    } else {
      // Plain text password (for backward compatibility)
      passwordValid = password === user.password;
    }

    if (!passwordValid) {
      return { success: false, message: 'Invalid credentials' };
    }

    const token = generateToken(user);

    return {
      success: true,
      user: {
        username: user.username,
        role: user.role
      },
      token
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: 'Authentication failed' };
  }
}

export async function getUserFromToken(token) {
  try {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    const { rows } = await pool.query(
      'SELECT username, role FROM login WHERE username = $1 AND role = $2',
      [decoded.username, 'admin']
    );

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
