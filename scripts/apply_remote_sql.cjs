const https = require('https');
const fs = require('fs');

const serviceRoleKey = 'sbp_38a9c3c3ca8d33891e80c280d9b7dc2d7fc8c359';
const projectRef = 'mctcnnmtudksgzuzknjo';

function runSql(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectRef}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (e) => reject(e.message));
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('Testing Management API access...');
  const testResult = await runSql('SELECT 1 as test');
  console.log(`Status: ${testResult.status}`);
  
  if (testResult.status === 401) {
    console.log(`Error: ${testResult.body}`);
    return;
  }
  
  if (testResult.status >= 400) {
    console.log(`API error: ${testResult.body}`);
    return;
  }
  console.log(`OK: ${testResult.body}`);

  // Apply fix_all_policies.sql
  const file1 = fs.readFileSync('scripts/fix_all_policies.sql', 'utf8');
  console.log('\nApplying fix_all_policies.sql...');
  let r = await runSql(file1);
  console.log(`Status: ${r.status}`);
  if (r.status >= 400) console.log(r.body); else console.log('OK');

  // Apply add_admin_policies.sql
  const file2 = fs.readFileSync('scripts/add_admin_policies.sql', 'utf8');
  console.log('Applying add_admin_policies.sql...');
  r = await runSql(file2);
  console.log(`Status: ${r.status}`);
  if (r.status >= 400) console.log(r.body); else console.log('OK');

  // Verify
  console.log('\nVerifying admin access...');
  r = await runSql("SELECT email, role FROM lingua_users WHERE email = 'admin@lingua.space'");
  console.log(`Status: ${r.status}, Result: ${r.body}`);

  console.log('\nDone!');
}

main().catch(console.error);
