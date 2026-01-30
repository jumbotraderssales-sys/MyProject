// recover-data.js
const fs = require('fs').promises;
const path = require('path');

async function recoverData() {
  console.log('🔍 Looking for recoverable data...');
  
  const dataDir = path.join(__dirname, 'data');
  
  // Check each data file
  const files = [
    'users.json',
    'trades.json', 
    'orders.json',
    'transactions.json',
    'payments.json'
  ];
  
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    try {
      await fs.access(filePath);
      const content = await fs.readFile(filePath, 'utf8');
      console.log(`\n📄 ${file}:`);
      console.log(`   Size: ${content.length} characters`);
      
      if (content.trim()) {
        try {
          const data = JSON.parse(content);
          if (Array.isArray(data)) {
            console.log(`   ✅ Valid JSON array with ${data.length} items`);
            if (file === 'users.json' && data.length > 0) {
              console.log('   👥 Users found:');
              data.forEach((user, i) => {
                console.log(`      ${i+1}. ${user.name || 'Unnamed'} (${user.email || 'No email'})`);
              });
            }
          } else if (typeof data === 'object') {
            console.log(`   ✅ Valid JSON object`);
          }
        } catch (parseError) {
          console.log(`   ❌ Invalid JSON: ${parseError.message}`);
          
          // Try to extract any recoverable data
          const emailMatches = content.match(/"email"\s*:\s*"([^"]+)"/g);
          const nameMatches = content.match(/"name"\s*:\s*"([^"]+)"/g);
          
          if (emailMatches) {
            console.log(`   🔍 Found ${emailMatches.length} email references`);
          }
        }
      } else {
        console.log(`   ⚠️  File is empty`);
      }
    } catch (error) {
      console.log(`   ❌ ${file}: ${error.message}`);
    }
  }
  
  // Check for backup files
  console.log('\n🔍 Checking for backup files...');
  try {
    const files = await fs.readdir(__dirname);
    const backupFiles = files.filter(f => f.includes('backup') || f.includes('.bak'));
    
    if (backupFiles.length > 0) {
      console.log('   Found backup files:');
      backupFiles.forEach(file => {
        console.log(`      📂 ${file}`);
      });
    } else {
      console.log('   No backup files found');
    }
  } catch (error) {
    console.log('   Error checking for backups');
  }
}

recoverData().catch(console.error);