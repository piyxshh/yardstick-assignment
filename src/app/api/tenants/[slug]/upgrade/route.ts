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

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
    const user = getUserFromRequest(req);
    const { slug } = params;

    
    if (user.role !== 'admin') {
        return NextResponse.json({ message: 'Forbidden: Only admins can upgrade.' }, { status: 403 });
    }

    
    if (user.tenantSlug !== slug) {
         return NextResponse.json({ message: 'Forbidden: Admin can only upgrade their own tenant.' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
        
        const result = await client.query("UPDATE tenants SET plan = 'pro' WHERE slug = $1 RETURNING *", [slug]);
         if (result.rowCount === 0) {
            return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
        }
        return NextResponse.json({ message: `Tenant ${slug} successfully upgraded to Pro plan.` });
    } finally {
        client.release();
    }
}