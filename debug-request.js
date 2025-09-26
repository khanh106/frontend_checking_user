// Debug API request để tìm nguyên nhân lỗi 500
const testRequest = async () => {
  const requestBody = {
    name: 'Debug User',
    email: `debug${Date.now()}@test.com`,
    password: 'Test1234!',
    confirmPassword: 'Test1234!'
  };

  console.log('Request Body:', JSON.stringify(requestBody, null, 2));

  try {
    console.log('Testing direct API call...');
    const response = await fetch('https://api.tira.click/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Direct API Response:', response.status, response.statusText);
    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data);
    } else {
      const error = await response.text();
      console.log('Error:', error);
    }

    console.log('\nTesting proxy call...');
    const proxyResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Proxy Response:', proxyResponse.status, proxyResponse.statusText);
    if (proxyResponse.ok) {
      const data = await proxyResponse.json();
      console.log('Success:', data);
    } else {
      const error = await proxyResponse.text();
      console.log('Error:', error);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
};

testRequest();
