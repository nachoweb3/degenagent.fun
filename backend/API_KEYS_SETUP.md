# API Keys Setup Guide

## Required API Keys for Production

### 1. Helius RPC API Key (CRITICAL)

**What it's for:** Solana RPC access for all blockchain operations

**How to get it:**
1. Go to https://www.helius.dev/
2. Click "Sign Up" or "Get Started"
3. Create account with email
4. Navigate to Dashboard > API Keys
5. Click "Create New API Key"
6. Select "Mainnet" network
7. Choose your plan:
   - Developer: $99/month - 1M requests
   - Pro: $299/month - 10M requests (RECOMMENDED)
8. Copy the API key

**Where to use it:**
```bash
# In .env.production
RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY
```

**Cost:** $299/month (Pro tier recommended)

---

### 2. Gemini API Key (RECOMMENDED)

**What it's for:** AI-powered trading insights and analysis

**How to get it:**
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Select "Create API key in new project" or use existing
5. Copy the API key (starts with "AIza...")

**Where to use it:**
```bash
# In .env.production
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

**Cost:** Free tier available
- Free: 60 requests/minute
- Paid: Custom pricing for higher limits

---

### 3. AWS Credentials (CRITICAL for Production)

**What it's for:** Secrets Manager and KMS for secure key storage

**How to set up:**

#### Step 1: Create AWS Account
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow signup process

#### Step 2: Create IAM User
1. Go to IAM Console
2. Click "Users" > "Add User"
3. Username: `agentfun-backend`
4. Access type: Programmatic access
5. Attach policies:
   - `SecretsManagerReadWrite`
   - `AWSKeyManagementServicePowerUser`

#### Step 3: Set up AWS Secrets Manager
1. Go to AWS Secrets Manager
2. Click "Store a new secret"
3. Choose "Other type of secret"
4. Add key-value pairs:
   - `ENCRYPTION_MASTER_KEY`: [your key]
   - `GEMINI_API_KEY`: [your key]
5. Name: `agentfun/production/secrets`
6. Enable automatic rotation (recommended)

#### Step 4: Create KMS Key
1. Go to AWS KMS
2. Click "Create key"
3. Key type: Symmetric
4. Key usage: Encrypt and decrypt
5. Alias: `agentfun-production`
6. Copy the Key ID

**Where to use it:**
```bash
# In .env.production
AWS_REGION=us-east-1
AWS_KMS_KEY_ID=your-kms-key-id-here
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

**Cost:** 
- Secrets Manager: $0.40/secret/month + $0.05/10,000 API calls
- KMS: $1/key/month + $0.03/10,000 requests
- Total: ~$2-5/month

---

### 4. Database (REQUIRED)

**Recommended: Supabase (easiest) or AWS RDS**

#### Option A: Supabase (Recommended)
1. Go to https://supabase.com/
2. Click "Start your project"
3. Create new project
4. Name: `agentfun-production`
5. Database password: [generate strong password]
6. Region: Choose closest to your users
7. Copy connection string

**Where to use it:**
```bash
# In .env.production
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

**Cost:**
- Free: $0 (limited)
- Pro: $25/month (RECOMMENDED)
- Team: $599/month

#### Option B: AWS RDS
1. Go to RDS Console
2. Create database
3. Engine: PostgreSQL
4. Template: Production
5. DB instance: db.t3.micro (start small)
6. Storage: 20GB SSD
7. Enable backups
8. Copy endpoint

**Cost:** ~$15-30/month for small instance

---

## Quick Setup Checklist

- [ ] Sign up for Helius ($299/month)
- [ ] Get Helius API key
- [ ] Update .env.production with RPC endpoint
- [ ] Sign up for Gemini AI (free)
- [ ] Get Gemini API key
- [ ] Create AWS account
- [ ] Set up AWS Secrets Manager
- [ ] Create KMS key
- [ ] Choose database provider
- [ ] Set up production database
- [ ] Update all keys in .env.production
- [ ] Test connections

## Total Monthly Cost

| Service | Cost | Required |
|---------|------|----------|
| Helius Pro | $299 | YES |
| Gemini API | $0 | NO (but recommended) |
| AWS Secrets/KMS | $5 | YES |
| Database (Supabase Pro) | $25 | YES |
| **TOTAL** | **$329/month** | - |

## Security Best Practices

1. **NEVER** commit .env.production to git
2. **ALWAYS** use AWS Secrets Manager in production
3. **ROTATE** API keys every 90 days
4. **MONITOR** API usage for anomalies
5. **LIMIT** API key permissions to minimum required
6. **BACKUP** all credentials in secure location (1Password, etc.)

## Testing Your Setup

```bash
# Test Helius connection
curl -X POST https://mainnet.helius-rpc.com/?api-key=YOUR_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

# Should return: {"jsonrpc":"2.0","result":"ok","id":1}

# Test Gemini API
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'

# Test database connection
psql $DATABASE_URL -c "SELECT 1"
```

## Support Contacts

- **Helius:** support@helius.dev
- **Gemini:** https://ai.google.dev/support
- **AWS:** AWS Support Center
- **Supabase:** support@supabase.io

---

Last updated: 2025-10-20
