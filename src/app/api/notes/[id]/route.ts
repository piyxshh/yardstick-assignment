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


export async function GET(req: NextRequest, context: { params: { id: string } }) {
    const user = getUserFromRequest(req);
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT * FROM notes WHERE id = $1 AND tenant_id = $2',
            [context.params.id, user.tenantId]
        );
        if (result.rows.length === 0) {
            return NextResponse.json({ message: 'Note not found' }, { status: 404 });
        }
        return NextResponse.json(result.rows[0]);
    } finally {
        client.release();
    }
}


export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    const user = getUserFromRequest(req);
    const { content } = await req.json();
    const client = await pool.connect();
    try {
        const result = await client.query(
            'UPDATE notes SET content = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3 RETURNING *',
            [content, context.params.id, user.tenantId]
        );
        if (result.rows.length === 0) {
            return NextResponse.json({ message: 'Note not found' }, { status: 404 });
        }
        return NextResponse.json(result.rows[0]);
    } finally {
        client.release();
    }
}


export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    const user = getUserFromRequest(req);
    const client = await pool.connect();
    try {
        const result = await client.query(
            'DELETE FROM notes WHERE id = $1 AND tenant_id = $2',
            [context.params.id, user.tenantId]
        );
        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'Note not found' }, { status: 404 });
        }
        return new NextResponse(null, { status: 204 });
    } finally {
        client.release();
    }
}