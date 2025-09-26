// Debug environment variables
console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('All env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT')));

// Test API client
const testAPIClient = async () => {
  try {
    console.log('Testing API client...');

    const response = await fetch('https://api.tira.click/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'debug@test.com',
        password: 'Abcdef1234!',
        confirmPassword: 'Abcdef1234!'
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response URL:', response.url);

    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data);
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('API test failed:', error.message);
  }
};

testAPIClient();
