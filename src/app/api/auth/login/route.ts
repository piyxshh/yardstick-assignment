import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';


const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
});

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  
  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
   
    const userResult = await client.query(
      `SELECT u.id, u.email, u.password_hash, u.role, u.tenant_id, t.slug as tenant_slug
       FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       WHERE u.email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user = userResult.rows[0];

    
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    
    const token = jwt.sign(
      {
        
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id,
        tenantSlug: user.tenant_slug,
      },
      process.env.JWT_SECRET!, 
      { expiresIn: '1h' } 
    );

    
    return NextResponse.json({ token });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}