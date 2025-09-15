import sql from "@/app/api/utils/sql";

// GET - Export leads to CSV
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const propertyType = searchParams.get('property_type');
    const timeline = searchParams.get('timeline');

    let query = `
      SELECT 
        id, first_name, last_name, email, phone, company,
        budget_min, budget_max, location, property_type,
        timeline, notes, status, source, created_at, updated_at
      FROM buyer_leads
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Apply same filters as the main list endpoint
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

    const leads = await sql(query, params);

    // Convert to CSV format
    const headers = [
      'ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Company',
      'Budget Min', 'Budget Max', 'Location', 'Property Type',
      'Timeline', 'Notes', 'Status', 'Source', 'Created At', 'Updated At'
    ];

    const csvRows = [headers.join(',')];

    for (const lead of leads) {
      const row = [
        lead.id,
        `"${(lead.first_name || '').replace(/"/g, '""')}"`,
        `"${(lead.last_name || '').replace(/"/g, '""')}"`,
        `"${(lead.email || '').replace(/"/g, '""')}"`,
        `"${(lead.phone || '').replace(/"/g, '""')}"`,
        `"${(lead.company || '').replace(/"/g, '""')}"`,
        lead.budget_min || '',
        lead.budget_max || '',
        `"${(lead.location || '').replace(/"/g, '""')}"`,
        `"${(lead.property_type || '').replace(/"/g, '""')}"`,
        `"${(lead.timeline || '').replace(/"/g, '""')}"`,
        `"${(lead.notes || '').replace(/"/g, '""')}"`,
        `"${(lead.status || '').replace(/"/g, '""')}"`,
        `"${(lead.source || '').replace(/"/g, '""')}"`,
        lead.created_at ? new Date(lead.created_at).toISOString() : '',
        lead.updated_at ? new Date(lead.updated_at).toISOString() : ''
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    const timestamp = new Date().toISOString().split('T')[0];

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="buyer-leads-${timestamp}.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting leads:', error);
    return Response.json({ error: 'Failed to export leads' }, { status: 500 });
  }
}