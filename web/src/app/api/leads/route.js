import sql from "@/app/api/utils/sql";

// GET - List all leads with optional search and filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const propertyType = searchParams.get('property_type');
    const timeline = searchParams.get('timeline');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = `
      SELECT * FROM buyer_leads
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(first_name) LIKE LOWER($${paramCount})
        OR LOWER(last_name) LIKE LOWER($${paramCount})
        OR LOWER(email) LIKE LOWER($${paramCount})
        OR LOWER(company) LIKE LOWER($${paramCount})
        OR LOWER(location) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (propertyType) {
      paramCount++;
      query += ` AND property_type = $${paramCount}`;
      params.push(propertyType);
    }

    if (timeline) {
      paramCount++;
      query += ` AND timeline = $${paramCount}`;
      params.push(timeline);
    }

    query += ` ORDER BY created_at DESC`;
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const leads = await sql(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total FROM buyer_leads
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (
        LOWER(first_name) LIKE LOWER($${countParamCount})
        OR LOWER(last_name) LIKE LOWER($${countParamCount})
        OR LOWER(email) LIKE LOWER($${countParamCount})
        OR LOWER(company) LIKE LOWER($${countParamCount})
        OR LOWER(location) LIKE LOWER($${countParamCount})
      )`;
      countParams.push(`%${search}%`);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND status = $${countParamCount}`;
      countParams.push(status);
    }

    if (propertyType) {
      countParamCount++;
      countQuery += ` AND property_type = $${countParamCount}`;
      countParams.push(propertyType);
    }

    if (timeline) {
      countParamCount++;
      countQuery += ` AND timeline = $${countParamCount}`;
      countParams.push(timeline);
    }

    const countResult = await sql(countQuery, countParams);
    const total = parseInt(countResult[0].total);

    return Response.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return Response.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

// POST - Create new lead
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.first_name || !body.last_name || !body.email) {
      return Response.json({ 
        error: 'First name, last name, and email are required' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return Response.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }

    // Check if email already exists
    const existingLead = await sql`
      SELECT id FROM buyer_leads WHERE email = ${body.email}
    `;
    
    if (existingLead.length > 0) {
      return Response.json({ 
        error: 'A lead with this email already exists' 
      }, { status: 409 });
    }

    const newLead = await sql`
      INSERT INTO buyer_leads (
        first_name, last_name, email, phone, company, 
        budget_min, budget_max, location, property_type, 
        timeline, notes, status, source
      ) VALUES (
        ${body.first_name}, ${body.last_name}, ${body.email}, 
        ${body.phone || null}, ${body.company || null},
        ${body.budget_min || null}, ${body.budget_max || null}, 
        ${body.location || null}, ${body.property_type || null},
        ${body.timeline || null}, ${body.notes || null}, 
        ${body.status || 'new'}, ${body.source || null}
      ) RETURNING *
    `;

    return Response.json(newLead[0], { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return Response.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}