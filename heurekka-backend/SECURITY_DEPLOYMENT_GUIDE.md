# 🚀 SECURITY DEPLOYMENT GUIDE
**Critical Security Implementation Deployment Instructions**

## ⚡ IMMEDIATE DEPLOYMENT CHECKLIST

### **Step 1: Database Migration (CRITICAL)**
```bash
# Run the security migration to create secure RPC functions
psql -h your-supabase-host -d your-database -f migrations/20250908_001_secure_distance_functions.sql
```

### **Step 2: Environment Variables (REQUIRED)**
Add these to your production environment:
```bash
# Authentication (CRITICAL - Generate secure random keys)
JWT_SECRET="$(openssl rand -base64 64)"
SESSION_SECRET="$(openssl rand -base64 64)"
IP_SALT="$(openssl rand -base64 32)"

# CORS (Update with your frontend domains)
CORS_ORIGINS="https://your-frontend-domain.com,https://app.yourdomain.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Step 3: Install Dependencies**
```bash
npm install
npm audit # Should show resolved critical vulnerabilities
```

### **Step 4: Build & Deploy**
```bash
npm run build
npm start
```

## 🔒 AUTHENTICATION INTEGRATION

### **Frontend Integration Required:**
1. **Update API calls to include JWT tokens:**
```typescript
// Before
const response = await trpc.homepage.saveProperty.mutate({
  propertyId: 'uuid'
});

// After - with authentication
const response = await trpc.homepage.saveProperty.mutate({
  propertyId: 'uuid'
}, {
  context: {
    headers: {
      'Authorization': `Bearer ${userToken}`
    }
  }
});
```

2. **Handle authentication errors:**
```typescript
try {
  const response = await trpc.homepage.saveProperty.mutate(data);
} catch (error) {
  if (error.data?.code === 'UNAUTHORIZED') {
    // Redirect to login or refresh token
    window.location.href = '/login';
  }
}
```

## 🛡️ MONITORING & ALERTS

### **Security Events to Monitor:**
- Failed authentication attempts
- Rate limiting violations
- Input sanitization triggers
- SQL injection attempts (should be blocked)
- Unusual traffic patterns

### **Recommended Alerts:**
```yaml
# Example monitoring rules
rate_limit_exceeded:
  condition: "rate_limit_errors > 10 per minute"
  action: "alert security team"

auth_failures:
  condition: "auth_failures > 50 per hour"
  action: "block IP temporarily"

sql_injection_attempts:
  condition: "sanitization triggers detected"
  action: "immediate security alert"
```

## 📊 TESTING GUIDE

### **Test Authentication:**
```bash
# Test public endpoint (should work)
curl -X POST http://localhost:3001/trpc/homepage.getFeaturedProperties \
  -H "Content-Type: application/json" \
  -d '{"json":{"limit":5}}'

# Test protected endpoint without auth (should fail)
curl -X POST http://localhost:3001/trpc/homepage.saveProperty \
  -H "Content-Type: application/json" \
  -d '{"json":{"propertyId":"test-uuid"}}'

# Test protected endpoint with valid JWT (should work)
curl -X POST http://localhost:3001/trpc/homepage.saveProperty \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"json":{"propertyId":"valid-uuid"}}'
```

### **Test Rate Limiting:**
```bash
# Rapid-fire requests to trigger rate limiting
for i in {1..150}; do
  curl -X POST http://localhost:3001/trpc/homepage.searchProperties &
done
# Should start returning 429 errors after 100 requests
```

## 🚨 ROLLBACK PLAN (If Needed)

### **If Critical Issues Occur:**
1. **Temporarily disable authentication:**
   ```bash
   # Set environment variable to bypass auth (EMERGENCY ONLY)
   DISABLE_AUTH_TEMPORARILY=true npm start
   ```

2. **Revert to previous version:**
   ```bash
   git revert HEAD
   npm run build
   npm start
   ```

3. **Database rollback:** 
   - Remove RPC functions if needed
   - Revert to string-based queries (INSECURE - temporary only)

## 📋 PRODUCTION CHECKLIST

- [ ] Database migration applied successfully
- [ ] All environment variables configured
- [ ] JWT secrets generated securely (64+ characters)
- [ ] CORS origins configured for production domains
- [ ] Rate limiting thresholds appropriate for traffic
- [ ] Error monitoring enabled
- [ ] Security alerts configured
- [ ] Load balancer health checks updated
- [ ] SSL/TLS certificates valid
- [ ] Firewall rules updated if needed
- [ ] DNS records pointing to new deployment
- [ ] Backup procedures tested
- [ ] Rollback plan documented and tested

## 🎯 SUCCESS CRITERIA

### **Deployment is successful when:**
- ✅ All public endpoints respond normally
- ✅ Authentication-required endpoints reject unauthenticated requests
- ✅ Valid JWT tokens allow access to protected endpoints
- ✅ Rate limiting triggers at configured thresholds
- ✅ No PII appears in logs (check analytics events)
- ✅ Error messages are sanitized (no internal details leaked)
- ✅ CORS headers present in responses
- ✅ Security headers visible in browser dev tools
- ✅ No critical vulnerabilities in npm audit
- ✅ Database queries use parameterized functions

### **Health Check Endpoint:**
```bash
curl http://localhost:3001/trpc/homepage.healthCheck
# Should return: {"status":"healthy","timestamp":"...","services":{...}}
```

## 🔧 TROUBLESHOOTING

### **Common Issues:**

1. **"JWT_SECRET not configured" error:**
   - Ensure JWT_SECRET environment variable is set
   - Check it's at least 32 characters long

2. **CORS errors in browser:**
   - Verify CORS_ORIGINS includes your frontend domain
   - Check for trailing slashes in URLs

3. **Database connection errors:**
   - Ensure migration was applied to correct database
   - Check Supabase connection credentials

4. **Rate limiting too aggressive:**
   - Adjust RATE_LIMIT_MAX_REQUESTS environment variable
   - Consider different limits for different endpoint types

5. **Authentication failing:**
   - Verify JWT token format and expiration
   - Check session/token storage in Redis
   - Ensure system clocks are synchronized

## 📞 SUPPORT

For deployment issues:
1. Check application logs for specific error messages
2. Verify all environment variables are set correctly
3. Test each security feature individually
4. Monitor resource usage (CPU/memory/Redis)
5. Check network connectivity and DNS resolution

---

**🚀 Ready for secure deployment! All critical vulnerabilities have been resolved.**