# Environment Variables Setup for Security Features

## 🔐 Required New Environment Variables

The security fixes require adding a new environment variable for encryption functionality.

### 1. Generate Encryption Key

Run this command to generate a secure encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output a 64-character hex string like:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### 2. Update Your .env File

Add this line to your `.env` file in `/heurekka-backend/.env`:

```bash
# Encryption key for secure token storage (REQUIRED)
ENCRYPTION_KEY=your_generated_key_from_step_1_here
```

### 3. Complete .env File Template

Here's a complete template with all required variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Security Configuration (NEW - REQUIRED)
ENCRYPTION_KEY=your_64_character_hex_encryption_key_here

# CORS Configuration (Optional - defaults to localhost:3000)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Environment
NODE_ENV=development

# Server Configuration (Optional)
PORT=3001
HOST=0.0.0.0
```

## 🚨 CRITICAL SECURITY NOTES

### DO NOT:
❌ Commit the `.env` file to Git
❌ Share your `ENCRYPTION_KEY` with anyone
❌ Use the same `ENCRYPTION_KEY` across different environments
❌ Use a weak or predictable encryption key

### DO:
✅ Generate a unique `ENCRYPTION_KEY` for each environment (dev, staging, prod)
✅ Store production keys in a secure secrets manager
✅ Rotate encryption keys periodically (recommended: every 90 days)
✅ Keep `.env` in your `.gitignore` file

## 🔄 For Different Environments

### Development (.env.development)
```bash
ENCRYPTION_KEY=dev_key_generated_with_node_command
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Production (.env.production)
```bash
ENCRYPTION_KEY=prod_key_different_from_dev
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
```

## 🧪 Verify Setup

After adding the environment variable, test that it's working:

1. Start your server:
   ```bash
   npm run dev
   ```

2. You should see in the logs:
   ```
   ✅ Auth service initialized with security hardening
   ✅ Audit logger initialized
   ```

3. If you see an error about missing `ENCRYPTION_KEY`, check:
   - The variable name is exactly `ENCRYPTION_KEY`
   - The file is named `.env` (not `.env.txt`)
   - The file is in the correct directory (`/heurekka-backend/`)
   - You restarted the server after adding the variable

## 📝 Additional Notes

### For Production Deployment

If you're using a platform like:

- **Vercel/Netlify**: Add environment variables in dashboard settings
- **Docker**: Pass via `docker run -e ENCRYPTION_KEY=...` or docker-compose
- **AWS/Azure**: Use secrets manager and inject at runtime
- **Heroku**: Use `heroku config:set ENCRYPTION_KEY=...`

### Key Rotation Procedure

When rotating encryption keys:

1. Generate new key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Add as `ENCRYPTION_KEY_NEW` temporarily
3. Update code to decrypt with old key, encrypt with new key
4. After migration, replace `ENCRYPTION_KEY` with new key
5. Remove old key

(Advanced: Contact backend engineer for key rotation scripts)

## 🆘 Troubleshooting

### Error: "ENCRYPTION_KEY environment variable is required"
**Solution**: Make sure you've added the `ENCRYPTION_KEY` to your `.env` file and restarted the server.

### Error: "Failed to encrypt data"
**Solution**: Your encryption key might be invalid. Regenerate it using the node command above.

### Error: "Failed to decrypt data"
**Solution**: The encryption key has changed since the data was encrypted. In development, you may need to clear encrypted data and re-authenticate.

## ✅ Setup Complete Checklist

Before considering setup complete:

- [ ] Generated unique `ENCRYPTION_KEY` using node command
- [ ] Added `ENCRYPTION_KEY` to `.env` file
- [ ] Verified `.env` is in `.gitignore`
- [ ] Tested server starts without encryption errors
- [ ] Documented production encryption key securely
- [ ] All team members have their own development keys

---

**Last Updated**: 2025-09-30
**Security Classification**: CONFIDENTIAL - Do not share encryption keys