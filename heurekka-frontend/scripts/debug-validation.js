#!/usr/bin/env node

const { validatePhoneNumber, validatePropertyId } = require('../src/lib/security/validation.ts');

console.log('=== Phone Number Debugging ===');
const phones = ['50412345678', '+50412345678', '22345678'];
phones.forEach(phone => {
  console.log(`\nTesting: "${phone}"`);
  const cleanPhone = phone.replace(/[-\s().+]/g, '');
  console.log(`Clean: "${cleanPhone}"`);
  console.log(`Length: ${cleanPhone.length}`);
  console.log(`Starts with 504: ${cleanPhone.startsWith('504')}`);
  
  if (cleanPhone.startsWith('504')) {
    const localPart = cleanPhone.substring(3);
    console.log(`Local part: "${localPart}"`);
    console.log(`Local length: ${localPart.length}`);
    console.log(`Local regex test: ${/^[2-9]\d{7}$/.test(localPart)}`);
  } else if (cleanPhone.length === 8) {
    console.log(`8-digit regex test: ${/^[2-9]\d{7}$/.test(cleanPhone)}`);
  }
  
  console.log(`Final result: ${validatePhoneNumber(phone)}`);
});

console.log('\n=== UUID Debugging ===');
const uuid = '123e4567-e89b-12d3-a456-426614174000';
console.log(`Testing: "${uuid}"`);
console.log(`Length: ${uuid.length}`);
console.log(`Regex: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`);
console.log(`Match: ${/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)}`);
console.log(`Final result: ${validatePropertyId(uuid)}`);

// Check each part
const parts = uuid.split('-');
console.log('Parts:', parts);
console.log('Part lengths:', parts.map(p => p.length));
console.log('Third char of part 2:', parts[2][0]);
console.log('First char of part 3:', parts[3][0]);