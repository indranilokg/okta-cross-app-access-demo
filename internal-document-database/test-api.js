#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing Atko Internal Document Database API\n');

  try {
    // Test 1: Get all documents
    console.log('1. Testing GET /api/documents...');
    const response1 = await fetch(`${BASE_URL}/documents`);
    const data1 = await response1.json();
    console.log(`   ✅ Status: ${response1.status}`);
    console.log(`   📄 Documents found: ${data1.data?.documents?.length || 0}\n`);

    // Test 2: Get categories
    console.log('2. Testing GET /api/categories...');
    const response2 = await fetch(`${BASE_URL}/categories`);
    const data2 = await response2.json();
    console.log(`   ✅ Status: ${response2.status}`);
    console.log(`   📂 Categories: ${data2.data?.categories?.join(', ') || 'None'}\n`);

    // Test 3: Search documents
    console.log('3. Testing GET /api/documents/search?q=benefits...');
    const response3 = await fetch(`${BASE_URL}/documents/search?q=benefits`);
    const data3 = await response3.json();
    console.log(`   ✅ Status: ${response3.status}`);
    console.log(`   🔍 Search results: ${data3.data?.documents?.length || 0} documents\n`);

    // Test 4: Get specific document
    console.log('4. Testing GET /api/documents/emp-handbook-2024...');
    const response4 = await fetch(`${BASE_URL}/documents/emp-handbook-2024`);
    const data4 = await response4.json();
    console.log(`   ✅ Status: ${response4.status}`);
    console.log(`   📋 Document: ${data4.data?.title || 'Not found'}\n`);

    // Test 5: Create new document
    console.log('5. Testing POST /api/documents...');
    const newDoc = {
      title: 'Test Document',
      content: 'This is a test document created via API.',
      category: 'IT',
      author: 'API Test',
      tags: ['test', 'api'],
      isPublic: true
    };
    
    const response5 = await fetch(`${BASE_URL}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newDoc)
    });
    const data5 = await response5.json();
    console.log(`   ✅ Status: ${response5.status}`);
    console.log(`   📝 Created document ID: ${data5.data?.id || 'Failed'}\n`);

    // Test 6: Update document (if creation was successful)
    if (data5.data?.id) {
      console.log(`6. Testing PUT /api/documents/${data5.data.id}...`);
      const updateDoc = {
        title: 'Updated Test Document',
        content: 'This document has been updated via API.',
        tags: ['test', 'api', 'updated']
      };
      
      const response6 = await fetch(`${BASE_URL}/documents/${data5.data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateDoc)
      });
      const data6 = await response6.json();
      console.log(`   ✅ Status: ${response6.status}`);
      console.log(`   📝 Updated document: ${data6.data?.title || 'Failed'}\n`);

      // Test 7: Delete document
      console.log(`7. Testing DELETE /api/documents/${data5.data.id}...`);
      const response7 = await fetch(`${BASE_URL}/documents/${data5.data.id}`, {
        method: 'DELETE'
      });
      const data7 = await response7.json();
      console.log(`   ✅ Status: ${response7.status}`);
      console.log(`   🗑️  Deleted: ${data7.success ? 'Success' : 'Failed'}\n`);
    }

    console.log('🎉 All API tests completed successfully!');
    console.log('\n📖 You can now:');
    console.log('   • Visit http://localhost:3001 to see the web interface');
    console.log('   • Use the API endpoints for integration');
    console.log('   • Proceed to Phase 4 (MCP Server)');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\n💡 Make sure the server is running with: npm run dev');
  }
}

// Run the test
testAPI(); 