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
    const { rows } = await pool.query(
      'SELECT username, password, role FROM login WHERE username = $1 AND password = $2 AND role = $3',
      [username, password, 'admin']
    );

    if (rows.length === 0) {
      return { success: false, message: 'Invalid credentials or not admin' };
    }

    const user = rows[0];
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
