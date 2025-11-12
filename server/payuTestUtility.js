/**
 * PayU Test Utility to verify credentials and hash calculation
 */
const crypto = require('crypto');

// Test hash calculation with your credentials
function testPayUHash() {
  const merchantKey = process.env.PAYU_MERCHANT_KEY;
  const merchantSalt = process.env.PAYU_MERCHANT_SALT;
  
  console.log('Testing PayU Credentials:');
  console.log('Merchant Key:', merchantKey);
  console.log('Salt (first 5 chars):', merchantSalt?.substring(0, 5) + '...');
  
  // Test with simple parameters
  const testParams = {
    key: merchantKey,
    txnid: 'TEST123456',
    amount: '100',
    productinfo: 'Test Product',
    firstname: 'Test',
    email: 'test@example.com'
  };
  
  // Generate hash with standard format
  const hashString = `${testParams.key}|${testParams.txnid}|${testParams.amount}|${testParams.productinfo}|${testParams.firstname}|${testParams.email}|||||||||||${merchantSalt}`;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');
  
  console.log('\nTest Hash Calculation:');
  console.log('Hash String:', hashString);
  console.log('Generated Hash:', hash);
  
  return {
    testParams,
    hash,
    hashString
  };
}

// Test if credentials work with PayU's verification endpoint
async function testPayUCredentials() {
  try {
    const testResult = testPayUHash();
    
    // Simulate a PayU request structure
    const payuTestData = {
      ...testResult.testParams,
      hash: testResult.hash,
      surl: 'https://yoursite.com/success',
      furl: 'https://yoursite.com/failure'
    };
    
    console.log('\nPayU Test Data Structure:');
    console.log(JSON.stringify(payuTestData, null, 2));
    
    return payuTestData;
  } catch (error) {
    console.error('PayU Test Error:', error);
    return null;
  }
}

module.exports = {
  testPayUHash,
  testPayUCredentials
};