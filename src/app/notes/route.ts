import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
});


function getUserFromRequest(req: NextRequest) {
    const userPayload = req.headers.get('x-user-payload');
    if (!userPayload) throw new Error("User payload not found in request");
    return JSON.parse(userPayload);
}


export async function GET(req: NextRequest) {
    const user = getUserFromRequest(req);
    const client = await pool.connect();
    try {
       
        const result = await client.query('SELECT * FROM notes WHERE tenant_id = $1 ORDER BY created_at DESC', [user.tenantId]);
        return NextResponse.json(result.rows);
    } finally {
        client.release();
    }
}


export async function POST(req: NextRequest) {
    const user = getUserFromRequest(req);
    const { content } = await req.json();

    if (!content) {
        return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        
        const tenantResult = await client.query('SELECT plan FROM tenants WHERE id = $1', [user.tenantId]);
        const plan = tenantResult.rows[0].plan;

        if (plan === 'free') {
            const notesCountResult = await client.query('SELECT COUNT(*) FROM notes WHERE tenant_id = $1', [user.tenantId]);
            if (parseInt(notesCountResult.rows[0].count, 10) >= 3) {
                return NextResponse.json({ message: 'Free plan limit of 3 notes reached. Please upgrade.' }, { status: 403 });
            }
        }

        const result = await client.query(
            'INSERT INTO notes (content, user_id, tenant_id) VALUES ($1, $2, $3) RETURNING *',
            [content, user.userId, user.tenantId]
        );
        return NextResponse.json(result.rows[0], { status: 201 });
    } finally {
        client.release();
    }
}