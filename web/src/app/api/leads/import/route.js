import sql from "@/app/api/utils/sql";

// POST - Import leads from CSV
export async function POST(request) {
  try {
    const body = await request.json();
    const { csvData } = body;

    if (!csvData || typeof csvData !== 'string') {
      return Response.json({ 
        error: 'CSV data is required' 
      }, { status: 400 });
    }

    // Parse CSV data
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      return Response.json({ 
        error: 'CSV must contain at least a header row and one data row' 
      }, { status: 400 });
    }

    // Parse header row
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Expected headers mapping
    const headerMap = {
      'first name': 'first_name',
      'firstname': 'first_name',
      'first_name': 'first_name',
      'last name': 'last_name',
      'lastname': 'last_name',
      'last_name': 'last_name',
      'email': 'email',
      'email address': 'email',
      'phone': 'phone',
      'phone number': 'phone',
      'company': 'company',
      'organization': 'company',
      'budget min': 'budget_min',
      'budget_min': 'budget_min',
      'min budget': 'budget_min',
      'budget max': 'budget_max',
      'budget_max': 'budget_max',
      'max budget': 'budget_max',
      'location': 'location',
      'city': 'location',
      'property type': 'property_type',
      'property_type': 'property_type',
      'type': 'property_type',
      'timeline': 'timeline',
      'timeframe': 'timeline',
      'notes': 'notes',
      'comments': 'notes',
      'status': 'status',
      'source': 'source',
      'lead source': 'source'
    };

    // Map headers to database fields
    const fieldMapping = {};
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase();
      if (headerMap[normalizedHeader]) {
        fieldMapping[index] = headerMap[normalizedHeader];
      }
    });

    // Check for required fields
    const requiredFields = ['first_name', 'last_name', 'email'];
    const mappedFields = Object.values(fieldMapping);
    const missingFields = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missingFields.length > 0) {
      return Response.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}. Please ensure your CSV has columns for first name, last name, and email.` 
      }, { status: 400 });
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: []
    };

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = [];
        let inQuotes = false;
        let currentValue = '';
        
        // Parse CSV row handling quoted values
        for (let j = 0; j < lines[i].length; j++) {
          const char = lines[i][j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim()); // Add the last value

        // Build lead object
        const leadData = {};
        Object.entries(fieldMapping).forEach(([index, field]) => {
          const value = values[parseInt(index)]?.replace(/"/g, '') || null;
          if (value && value !== '') {
            if (field === 'budget_min' || field === 'budget_max') {
              const numValue = parseInt(value.replace(/[^0-9]/g, ''));
              if (!isNaN(numValue)) {
                leadData[field] = numValue;
              }
            } else {
              leadData[field] = value;
            }
          }
        });

        // Validate required fields
        if (!leadData.first_name || !leadData.last_name || !leadData.email) {
          results.errors.push(`Row ${i + 1}: Missing required fields`);
          results.skipped++;
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(leadData.email)) {
          results.errors.push(`Row ${i + 1}: Invalid email format`);
          results.skipped++;
          continue;
        }

        // Check if email already exists
        const existingLead = await sql`
          SELECT id FROM buyer_leads WHERE email = ${leadData.email}
        `;
        
        if (existingLead.length > 0) {
          results.errors.push(`Row ${i + 1}: Email ${leadData.email} already exists`);
          results.skipped++;
          continue;
        }

        // Insert the lead
        await sql`
          INSERT INTO buyer_leads (
            first_name, last_name, email, phone, company, 
            budget_min, budget_max, location, property_type, 
            timeline, notes, status, source
          ) VALUES (
            ${leadData.first_name}, ${leadData.last_name}, ${leadData.email}, 
            ${leadData.phone || null}, ${leadData.company || null},
            ${leadData.budget_min || null}, ${leadData.budget_max || null}, 
            ${leadData.location || null}, ${leadData.property_type || null},
            ${leadData.timeline || null}, ${leadData.notes || null}, 
            ${leadData.status || 'new'}, ${leadData.source || 'import'}
          )
        `;

        results.imported++;
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        results.errors.push(`Row ${i + 1}: ${error.message}`);
        results.skipped++;
      }
    }

    return Response.json(results);
  } catch (error) {
    console.error('Error importing leads:', error);
    return Response.json({ error: 'Failed to import leads' }, { status: 500 });
  }
}