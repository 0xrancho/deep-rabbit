# SEP Discovery Wizard - Refactor Analysis

## Current Code Usage Status

### ✅ **NEW Discovery Wizard Code (Keep All)**
```
src/pages/
├── DiscoverySetup.tsx          ✅ NEW - Setup wizard
├── DiscoveryICP.tsx            ✅ NEW - Industry selection  
├── DiscoveryContext.tsx        ✅ NEW - Context configuration
├── DiscoverySessionV2.tsx      ✅ NEW - Main discovery interface
├── DiscoveryScopingReview.tsx  ✅ NEW - Pre-report review
├── DiscoverySummary.tsx        ✅ NEW - Analysis & reporting
└── NotFound.tsx                ✅ NEW - 404 handler

src/types/
└── discovery.ts                ✅ NEW - Discovery type definitions

src/services/
├── elicitationEngine.ts        ✅ NEW - CBAP intelligence
└── openai.ts                   ✅ ADAPTED - Enhanced for discovery

src/components/
└── ScopingReview.tsx           ✅ NEW - Pre-report component

src/lib/
└── mockStorage.ts              ✅ NEW - Discovery persistence
```

### ⚠️ **GABI ASSESS Legacy (CANDIDATES FOR REMOVAL)**

#### Assessment Flow (REMOVE ENTIRELY)
```
❌ REMOVE - No longer used:
src/components/assessment/
├── Step1BusinessType.tsx       - Old assessment step
├── Step2OpportunityFocus.tsx   - Old assessment step
├── Step3RevenueModel.tsx       - Old assessment step
├── Step4Challenges.tsx         - Updated for revenue metrics but not used
├── Step5TeamInvolved.tsx       - Old assessment step
├── Step6ProcessDescription.tsx - Old assessment step
├── Step7TechStack.tsx          - Old assessment step
├── Step8InvestmentLevel.tsx    - Old assessment step
├── Step9AdditionalContext.tsx  - Old assessment step
└── DeepReportGeneration.tsx    - Old reporting component

src/components/
└── EnhancedAssessmentFlow.tsx  - Old assessment orchestrator

src/pages/
├── AssessmentLanding.tsx       - Legacy landing page
├── AssessmentReport.tsx        - Old report page
├── AssessmentStep.tsx          - Old step-by-step flow
├── EnhancedAssessmentReport.tsx- Legacy enhanced report
├── DiscoverySession.tsx        - Old chat-style interface (superseded by V2)
└── Index.tsx                   - Old homepage
```

#### Assessment Intelligence (REMOVE ENTIRELY)
```
❌ REMOVE - Complex assessment logic no longer needed:
src/lib/assessment/
├── curator/                    - Data processing for old assessments
├── enhanced-assessment-orchestrator.ts
├── enhanced-icp-definitions.ts
├── input-compiler.ts
├── intelligence-orchestrator.ts
├── intelligence-usage-map.ts
├── metric-definitions.ts
├── minimal-report-generator.ts
├── report-formatter.ts
├── report-sections-v3.ts
├── report-synthesizer.ts
├── research-engine.ts
├── simplified-research-engine.ts
├── simplified-research-prompt.ts
└── vector-rag-retriever.ts

src/lib/intelligence/
├── fallback-intelligence.ts
├── local-intelligence-loader.ts
├── minimal-rag-retriever.ts
└── rag-retriever.ts

src/lib/
├── contextInference.ts
├── dataHelpers.ts
├── kpiSuggestions.ts
├── researchSequence.ts
└── devLogger.ts

src/types/
└── assessment.ts               - Old assessment types
```

### 🔄 **KEEP & REFERENCE Later**

#### Report Generation Infrastructure
```
✅ KEEP - Will need for production:
src/services/
├── perplexityReportGenerator.ts  - Perplexity API integration patterns
├── reportGenerator.ts            - Report generation utilities
└── deepReportGenerator.ts        - Deep analysis patterns

src/prompts/
└── index.ts                      - Prompt engineering patterns
```

#### Core Infrastructure  
```
✅ KEEP - Production dependencies:
src/lib/
├── supabase.ts                   - Database config (need for production)
├── mockAuth.ts                   - Auth patterns
└── utils.ts                      - Utility functions

src/components/ui/
└── [all components]              - shadcn/ui components (all used)

src/hooks/
├── use-mobile.tsx                - Mobile detection
└── use-toast.ts                  - Toast notifications
```

#### Configuration & Setup
```
✅ KEEP - Configuration files:
./config/intelligence-sources.ts  - May reference for Perplexity config
./core-tools-seed.json            - Intelligence data (may reference)
./supabase/migrations/            - Database schemas (need for production)
./test-*.ts                       - Test files (may reference patterns)
```

---

## 📊 **Recycling Analysis**

### New Code vs. Recycled
- **~85% NEW CODE** - Discovery Wizard implementation
- **~10% ADAPTED** - OpenAI service, mockStorage patterns
- **~5% DIRECT REUSE** - UI components, utilities

### File Count Impact
- **Current**: ~110 files in src/
- **After cleanup**: ~40 files in src/
- **Reduction**: ~70 files (63% reduction)

---

## 🗑️ **Recommended Deletion Plan**

### Phase 1: Safe Deletions (No Dependencies)
```bash
# Remove old assessment components
rm -rf src/components/assessment/
rm src/components/EnhancedAssessmentFlow.tsx

# Remove old pages
rm src/pages/AssessmentLanding.tsx
rm src/pages/AssessmentReport.tsx  
rm src/pages/AssessmentStep.tsx
rm src/pages/EnhancedAssessmentReport.tsx
rm src/pages/DiscoverySession.tsx  # Old chat interface
rm src/pages/Index.tsx

# Remove old types
rm src/types/assessment.ts
```

### Phase 2: Assessment Intelligence Cleanup
```bash
# Remove complex assessment logic
rm -rf src/lib/assessment/
rm -rf src/lib/intelligence/

# Remove assessment utilities
rm src/lib/contextInference.ts
rm src/lib/dataHelpers.ts
rm src/lib/kpiSuggestions.ts
rm src/lib/researchSequence.ts
rm src/lib/devLogger.ts
```

### Phase 3: Route & Configuration Cleanup
```bash
# Update App.tsx to remove old assessment routes
# Keep only discovery wizard routes + NotFound

# Clean package.json of unused dependencies
# Remove any assessment-specific scripts
```

---

## 🔒 **ARCHIVE Before Deletion**

### Create Reference Archive
```bash
# Archive key patterns for future reference
mkdir -p ./archive/reference/
cp -r src/services/perplexityReportGenerator.ts ./archive/reference/
cp -r src/services/reportGenerator.ts ./archive/reference/
cp -r src/services/deepReportGenerator.ts ./archive/reference/
cp -r src/prompts/ ./archive/reference/
cp -r config/intelligence-sources.ts ./archive/reference/
cp -r supabase/migrations/ ./archive/reference/
```

### Keep Production Integration Points
```bash
# These will be needed when going to production
- src/lib/supabase.ts (database config)
- .env.example (API configurations)
- supabase/migrations/ (database schemas)
- Archive of Perplexity integration patterns
- Archive of report formatting utilities
```

---

## 🎯 **Post-Cleanup Benefits**

1. **Cleaner Codebase**: 63% reduction in files
2. **Faster Builds**: Less code to compile
3. **Easier Navigation**: Clear discovery-focused structure
4. **Reduced Confusion**: No dead code paths
5. **Better Maintainability**: Only active code remains

## 📁 **Final Clean Directory Structure**
```
src/
├── components/
│   ├── ui/              # Keep all - shadcn components
│   └── ScopingReview.tsx
├── hooks/               # Keep - utility hooks
├── lib/
│   ├── mockStorage.ts   # Discovery persistence
│   ├── supabase.ts      # Production database
│   ├── mockAuth.ts      # Auth patterns
│   └── utils.ts         # Utilities
├── pages/
│   ├── DiscoverySetup.tsx
│   ├── DiscoveryICP.tsx  
│   ├── DiscoveryContext.tsx
│   ├── DiscoverySessionV2.tsx
│   ├── DiscoveryScopingReview.tsx
│   ├── DiscoverySummary.tsx
│   └── NotFound.tsx
├── services/
│   ├── elicitationEngine.ts
│   ├── openai.ts
│   ├── perplexityReportGenerator.ts  # Keep for production
│   └── reportGenerator.ts           # Keep for production
├── types/
│   └── discovery.ts
└── main.tsx
```

This cleanup will create a **focused, maintainable Discovery Wizard** while preserving the valuable integration patterns for production deployment.