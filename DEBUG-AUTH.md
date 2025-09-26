# Hướng Dẫn Debug Vấn Đề Đăng Nhập

## Vấn Đề
Khi đăng nhập thành công, user bị đẩy ra màn login sau một lúc.

## Nguyên Nhân Chính
1. **Race Condition**: ProtectedLayout kiểm tra token trước khi token được lưu vào localStorage
2. **Timing Issues**: setTimeout không đủ thời gian để localStorage được cập nhật
3. **State Management**: AuthProvider và ProtectedLayout không đồng bộ

## Giải Pháp Đã Áp Dụng

### 1. Tăng Thời Gian Đợi
```typescript
// AuthProvider - login function
setTimeout(() => {
  console.log('🔄 Redirecting to dashboard...')
  router.push(redirectTo || '/dashboard')
}, 300) // Tăng từ 50ms lên 300ms

// ProtectedLayout - token check
setTimeout(() => {
  const token = localStorage.getItem('token')
  // ... check logic
}, 500) // Tăng từ 100ms lên 500ms
```

### 2. Thêm Token Verification
```typescript
// Verify token was saved
const savedToken = localStorage.getItem('token')
console.log('🔍 Token verification:', { saved: !!savedToken, matches: savedToken === response.token })

// Retry if not saved correctly
if (!savedToken || savedToken !== response.token) {
  console.log('⚠️ Token not saved correctly, retrying...')
  localStorage.setItem('token', response.token)
}
```

### 3. Thêm isLoggingIn Flag
```typescript
// AuthProvider
const [isLoggingIn, setIsLoggingIn] = useState(false)

// ProtectedLayout
if (!isLoading && !hasCheckedAuth && !isLoggingIn) {
  // Chỉ check token khi không đang login
}
```

### 4. Thêm hasCheckedAuth Flag
```typescript
// Tránh check nhiều lần
const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

// Reset khi user thay đổi
useEffect(() => {
  if (!user) {
    setHasCheckedAuth(false)
  }
}, [user])
```

## Debug Logs Để Theo Dõi

### 1. Login Process
```
🔍 Login Response: { user: {...}, token: "..." }
✅ Token saved to localStorage: mock-jwt-token-...
🔍 Token verification: { saved: true, matches: true }
✅ User data set: { name: "Test User", ... }
🔄 Redirecting to dashboard...
🔍 Final token check before redirect: mock-jwt-token-...
```

### 2. ProtectedLayout Check
```
🔍 ProtectedLayout checking token: { token: true, hasValidToken: true, isLoggingIn: false }
✅ Valid token found, allowing access
```

### 3. Error Cases
```
❌ No valid token found, redirecting to login
⚠️ Token not saved correctly, retrying...
```

## Cách Test

### 1. Chạy Test Script
```bash
node test-auth-flow.js
```

### 2. Kiểm Tra Browser Console
- Mở Developer Tools (F12)
- Vào tab Console
- Thực hiện login
- Theo dõi các log messages

### 3. Kiểm Tra localStorage
```javascript
// Trong browser console
console.log('Token:', localStorage.getItem('token'))
console.log('All localStorage:', { ...localStorage })
```

## Troubleshooting

### Nếu Vẫn Bị Đẩy Ra Login:

1. **Kiểm tra localStorage**
   ```javascript
   localStorage.getItem('token')
   ```

2. **Kiểm tra timing**
   - Tăng setTimeout trong AuthProvider lên 500ms
   - Tăng setTimeout trong ProtectedLayout lên 1000ms

3. **Kiểm tra browser compatibility**
   - Test trên Chrome, Firefox, Safari
   - Kiểm tra private/incognito mode

4. **Kiểm tra network issues**
   - API login có trả về token không
   - Network tab trong DevTools

### Nếu Token Bị Mất:

1. **Kiểm tra browser settings**
   - Clear cookies và localStorage
   - Disable extensions

2. **Kiểm tra code**
   - Có chỗ nào gọi `localStorage.removeItem('token')` không
   - Có chỗ nào gọi `logout()` không

## Monitoring

### 1. Thêm Error Tracking
```typescript
try {
  // login logic
} catch (error) {
  console.error('❌ Login error:', error)
  // Send to error tracking service
}
```

### 2. Thêm Performance Monitoring
```typescript
const startTime = performance.now()
// ... login process
const endTime = performance.now()
console.log(`Login took ${endTime - startTime} milliseconds`)
```

## Kết Luận

Vấn đề đăng nhập bị đẩy ra màn login đã được fix bằng cách:
- Tăng thời gian đợi cho localStorage operations
- Thêm verification và retry mechanism
- Sử dụng flags để tránh race conditions
- Thêm debug logs chi tiết

Nếu vẫn có vấn đề, hãy kiểm tra browser console và localStorage để debug thêm.
