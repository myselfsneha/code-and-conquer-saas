# React Native API Service

## Files
- `services/apiService.js` - reusable fetch-based service
- `services/apiConfig.example.js` - sample configurable base URL

## Quick usage

```js
const { API_CONFIG } = require('./services/apiConfig');
const { createApiService } = require('./services/apiService');

const api = createApiService({ baseUrl: API_CONFIG.baseUrl });

async function handleLogin() {
  const response = await api.login({
    email: 'admin@example.com',
    password: 'secret123',
    role: 'admin',
    tenant_id: 1001,
  });

  // response is parsed JSON from backend
  console.log(response);
}
```
