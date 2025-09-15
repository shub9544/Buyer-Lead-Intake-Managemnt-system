import sql from "@/app/api/utils/sql";

// GET - Get single lead by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return Response.json({ error: 'Invalid lead ID' }, { status: 400 });
    }

    const lead = await sql`
      SELECT * FROM buyer_leads WHERE id = ${parseInt(id)}
    `;

    if (lead.length === 0) {
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    return Response.json(lead[0]);
  } catch (error) {
    console.error('Error fetching lead:', error);
    return Response.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}

// PUT - Update lead
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!id || isNaN(parseInt(id))) {
      return Response.json({ error: 'Invalid lead ID' }, { status: 400 });
    }

    // Check if lead exists
    const existingLead = await sql`
      SELECT id FROM buyer_leads WHERE id = ${parseInt(id)}
    `;
    
    if (existingLead.length === 0) {
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Validate email format if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return Response.json({ 
          error: 'Invalid email format' 
        }, { status: 400 });
      }

      // Check if email already exists for another lead
      const emailCheck = await sql`
        SELECT id FROM buyer_leads WHERE email = ${body.email} AND id != ${parseInt(id)}
      `;
      
      if (emailCheck.length > 0) {
        return Response.json({ 
          error: 'A lead with this email already exists' 
        }, { status: 409 });
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone', 'company',
      'budget_min', 'budget_max', 'location', 'property_type',
      'timeline', 'notes', 'status', 'source'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        paramCount++;
        updateFields.push(`${field} = $${paramCount}`);
        updateValues.push(body[field]);
      }
    }

    if (updateFields.length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Add updated_at timestamp
    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(new Date().toISOString());

    // Add ID for WHERE clause
    paramCount++;
    updateValues.push(parseInt(id));

    const updateQuery = `
      UPDATE buyer_leads 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const updatedLead = await sql(updateQuery, updateValues);

    return Response.json(updatedLead[0]);
  } catch (error) {
    console.error('Error updating lead:', error);
    return Response.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

// DELETE - Delete lead
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return Response.json({ error: 'Invalid lead ID' }, { status: 400 });
    }

    const deletedLead = await sql`
      DELETE FROM buyer_leads WHERE id = ${parseInt(id)} RETURNING *
    `;

    if (deletedLead.length === 0) {
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    return Response.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return Response.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}