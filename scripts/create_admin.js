const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'postgresumanth8215',
  host: 'localhost',
  port: 5432,
  database: 'mth',
});

async function run() {
  try {
    await client.connect();
    
    // First, let's see what roles exist in the roles table
    const rolesRes = await client.query('SELECT * FROM roles');
    console.log("Roles found:");
    console.table(rolesRes.rows);

    // Now, let's insert or promote an admin user
    // We'll create a dedicated admin user if one doesn't exist.
    const adminEmail = 'admin@microtask.com';
    const checkAdmin = await client.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    
    let adminRole = 2; // Assuming 2 is admin based on typical patterns, we'll see if it's in the roles table
    if (rolesRes.rows.length > 0) {
        // Try to find a role with name containing 'admin'
        const adminRoleRow = rolesRes.rows.find(r => r.rolename && r.rolename.toLowerCase().includes('admin'));
        if (adminRoleRow) {
            adminRole = adminRoleRow.role;
        } else {
            // If no admin role exists, let's insert it
            const maxRole = Math.max(...rolesRes.rows.map(r => r.role), 1);
            adminRole = maxRole + 1;
            await client.query('INSERT INTO roles (role, rolename) VALUES ($1, $2)', [adminRole, 'Admin']);
            console.log(`Created new role 'Admin' with ID ${adminRole}`);
        }
    } else {
        // No roles table populated? We'll just force role=5 for admin as a safe bet
        adminRole = 5;
    }

    if (checkAdmin.rows.length === 0) {
        // Insert admin
        const insertQuery = `
            INSERT INTO users (fullname, phone, email, password, role, status)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await client.query(insertQuery, ['System Administrator', '0000000000', adminEmail, 'admin123', adminRole, 1]);
        console.log(`\nSuccessfully CREATED Admin User!`);
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: admin123`);
        console.log(`Role Assigned: ${adminRole}`);
    } else {
        // Update existing admin
        await client.query('UPDATE users SET role = $1 WHERE email = $2', [adminRole, adminEmail]);
        console.log(`\nSuccessfully PROMOTED existing user '${adminEmail}' to Admin (Role: ${adminRole})!`);
        console.log(`Password remains whatever it was previously (or 'admin123' if newly created).`);
    }

  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

run();
