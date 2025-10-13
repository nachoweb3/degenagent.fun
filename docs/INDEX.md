# 📚 Documentation Index - Agent.fun

## 📖 Main Documentation

### Start Here
1. **[README.md](../README.md)** - Project overview and quick start
2. **[MAINNET_DEPLOYMENT.md](./MAINNET_DEPLOYMENT.md)** - Complete mainnet deployment guide
3. **[SECURITY.md](./SECURITY.md)** - Security implementation details

---

## 💰 Deployment Information

### [MAINNET_DEPLOYMENT.md](./MAINNET_DEPLOYMENT.md)
Complete step-by-step guide to deploy Agent.fun to Solana mainnet.

**Topics covered:**
- Prerequisites and tools installation
- Wallet configuration
- Smart contract compilation
- Deployment process
- Factory initialization
- Backend/frontend configuration
- Testing and verification
- Cost breakdown (~15-25 SOL)

**Time to complete**: 2-3 hours

---

### [DEPLOYMENT_COSTS_MAINNET.md](./DEPLOYMENT_COSTS_MAINNET.md)
Detailed breakdown of all deployment costs.

**Includes:**
- Exact SOL costs for each step
- USD equivalent calculations
- Operating costs (monthly)
- Revenue model and break-even analysis
- Assisted deployment option

**Recommended wallet**: 20-25 SOL

---

## 🔐 Security Documentation

### [SECURITY.md](./SECURITY.md)
Complete security implementation documentation.

**Topics covered:**
- AES-256-GCM encryption system
- Key management (keyManager.ts)
- PBKDF2 key derivation
- Secure logging practices
- AWS Secrets Manager integration
- Production security checklist
- Threat model and mitigation

**Test results**: 8/8 passing

---

## 📁 Archive (Reference Only)

The following documents are kept for reference but have been superseded by the main documentation:

### Development History
- `archive/FRONTEND_IMPROVEMENTS_VISUAL.md` - UI improvements log
- `archive/INDEX_MEJORAS_FRONTEND.md` - Frontend improvements index
- `archive/UI_CHANGES_SUMMARY.md` - UI changes summary
- `archive/MOBILE_IMPROVEMENTS.md` - Mobile optimization notes

### Setup Guides (Old)
- `archive/QUICKSTART.md` - Old quick start guide
- `archive/INSTALL_DEPENDENCIES.md` - Dependencies installation
- `archive/GEMINI_SETUP.md` - Gemini AI setup
- `archive/DESPLIEGUE_COMPLETO.md` - Spanish deployment guide

### Implementation Reports
- `archive/IMPLEMENTATION_REPORT.md` - Security implementation
- `archive/SECURITY_IMPLEMENTATION_SUMMARY.md` - Security summary
- `archive/SECURITY_SETUP.md` - Security setup guide
- `archive/SECURITY_EXAMPLES.md` - Security code examples

### Feature Documentation
- `archive/REVENUE_SHARE_IMPLEMENTATION.md` - Revenue sharing feature
- `archive/agents.md` - Agent development guide
- `archive/RESUMEN_MEJORAS.md` - Improvements summary (Spanish)

### UI Documentation
- `archive/UI_SCREENSHOTS.md` - UI screenshots and examples
- `archive/START_HERE.md` - Old start guide
- `archive/PRODUCTION_READY_CHECKLIST.md` - Old checklist

---

## 🗂️ Documentation Structure

```
docs/
├── INDEX.md                        # This file
├── MAINNET_DEPLOYMENT.md          # Main deployment guide
├── DEPLOYMENT_COSTS_MAINNET.md    # Cost breakdown
├── SECURITY.md                     # Security documentation
└── archive/                        # Old/reference docs
    ├── agents.md
    ├── FRONTEND_IMPROVEMENTS_VISUAL.md
    ├── GEMINI_SETUP.md
    ├── ... (15+ reference files)
```

---

## 📝 Documentation Usage

### For First-Time Setup
1. Read [README.md](../README.md)
2. View UI at http://localhost:3002
3. Read [MAINNET_DEPLOYMENT.md](./MAINNET_DEPLOYMENT.md)

### For Deployment
1. Review [DEPLOYMENT_COSTS_MAINNET.md](./DEPLOYMENT_COSTS_MAINNET.md)
2. Follow [MAINNET_DEPLOYMENT.md](./MAINNET_DEPLOYMENT.md) step-by-step
3. Use automated scripts in `../scripts/`

### For Security Review
1. Read [SECURITY.md](./SECURITY.md)
2. Run security tests: `cd backend && npm run test:security`
3. Review `archive/SECURITY_IMPLEMENTATION_SUMMARY.md` for details

### For Development
1. Check code comments in source files
2. Review `archive/agents.md` for agent development
3. Check `archive/` for specific feature documentation

---

## 🔗 Quick Links

### Essential Reading
- [Main README](../README.md) - Start here
- [Deployment Guide](./MAINNET_DEPLOYMENT.md) - How to deploy
- [Security Docs](./SECURITY.md) - Security implementation

### Code Locations
- Frontend: `../frontend/app/`
- Backend: `../backend/src/`
- Executor: `../executor/src/`
- Smart Contracts: `../programs/`

### Scripts
- Deployment: `../scripts/deploy-mainnet.sh`
- Initialize: `../scripts/initialize-mainnet.ts`
- Verify: `../scripts/verify-mainnet.sh`

---

## 💡 Documentation Guidelines

### When to Use Each Doc

**README.md** → Overview, quick start, current status
**MAINNET_DEPLOYMENT.md** → Step-by-step mainnet deployment
**DEPLOYMENT_COSTS_MAINNET.md** → Cost planning and breakdown
**SECURITY.md** → Security implementation details
**archive/** → Historical reference, old guides

### Keeping Docs Updated

Main docs (README, MAINNET_DEPLOYMENT, SECURITY) are kept current.
Archive docs are frozen for reference.

---

## 📞 Getting Help

1. Check relevant documentation
2. Review code comments
3. Check terminal logs
4. Verify on Solscan (for blockchain issues)

---

**Last Updated**: 2025-01-13
**Documentation Version**: 2.0
**Status**: Current and Complete
