# QA Log - Functional Issues

## 1. UI/UX - Assessment

### ICP Management
- **Issue**: Need to consider limiting ICPs or greying some out for now
- **Priority**: Medium
- **Status**: Needs decision from product team

### Prompt Suggestions
- **Issue**: Consider smoother ways to handle prompt suggestions based on ICP area
- **Description**: Current prompt suggestions may not be contextual enough to selected ICP
- **Priority**: Medium
- **Status**: Needs UX review

### ICP Naming Overlap
- **Issue**: Consider renaming some of the ICPs for less overlap
- **Description**: Current ICP categories may have confusing overlap causing user confusion
- **Priority**: Medium
- **Status**: Needs product review

## 2. Report Issues

### Report Length & Compression
- **Issue**: The generated report is too short and when you scroll down to the bottom of the page and see the CTAs, they become anchored and the report is even more compressed
- **Priority**: High
- **Status**: Critical - affects user experience
- **Impact**: Report feels incomplete and UI is broken

### Mobile Optimization
- **Issue**: Needs mobile react optimization
- **Priority**: High
- **Status**: Critical for user adoption

### Visual Inconsistency - Quick Win Section
- **Issue**: Remove colored boxes for the Quick Win section of In Scope Solutions, just keep for GABI Solution
- **Priority**: Medium
- **Status**: Needs design update
- **Location**: `report-sections-v3.ts` - `generateQuickWinSolution()`

### Colored Box Alignment - GABI Solution
- **Issue**: The colored boxes for GABI solution still don't line up. They either all need to be on one line or all vertically stacked taking the whole span of the page, it's a stack not a stagger
- **Priority**: High
- **Status**: Critical visual bug
- **Technical**: CSS grid layout issue with `grid-template-columns: repeat(4, 1fr)`
- **Expected**: Either horizontal single line OR vertical full-width stack

### Language & Positioning Meta Problem
- **Issue**: The language we use for this tool is critical as it's very meta. It's a presales AI lead conversion assessment tool that is also a product of other technology service providers that need to use AI lead conversion assessments. The Assessment output is technology consulting solutioning.
- **Priority**: Critical
- **Status**: Foundational issue
- **Current Terms Under Review**: 
  - "revenue intelligence"
  - "AI transformation report" 
  - "technology assessment"
- **Need**: More clear, less meta language that doesn't confuse the value proposition

## 3. Research Logic Issues

### Query Distribution Problem
- **Issue**: We need QA on what queries are run by Perplexity versus GPT. It seems like GPT might be doing more than it should. It also seems like Perplexity might not be doing as much of a deep research as it should.
- **Priority**: High
- **Status**: Critical - affects research quality
- **Investigation Needed**: Query routing logic analysis

### Fallback Logic Inconsistency
- **Issue**: Why are we getting fallbacks for some queries and not others, especially when the input is ample and hyper contextualized?
- **Priority**: High
- **Status**: Critical - research system unreliable
- **Expected**: Research should fill the gap when input is strong, but specific RAG cases and tools are not identified

### Hard-coded "Lead Qualification" Bug
- **Issue**: There is a critical business issue of a hard coded instance of "Lead Qualification" somewhere as this latest test has nothing to do with top of funnel and everything to do with delivery time, yet the entire report was about Lead Qualification.
- **Priority**: Critical
- **Status**: Blocking - completely wrong report generation
- **Root Cause**: Unknown - could be research issue, caching issues, or report formation issue
- **Investigation Areas**:
  - Research query logic
  - Caching system
  - Report template selection
  - Input parsing

### Solution Mismatch
- **Issue**: Similarly the solution portion seems like it was either cached or completely wrong based on the inputs
- **Priority**: Critical
- **Status**: Blocking - solutions don't match user inputs
- **Related**: May be connected to Lead Qualification hard-coding issue

### Case Study Caching/Mismatch
- **Issue**: Case studies must also have been cached or related to Lead Qualification
- **Priority**: High
- **Status**: Case studies not contextual to actual user challenge
- **Expected**: Case studies should be relevant to user's specific business type and challenge

## Investigation Required

### Immediate Actions Needed:
1. **Trace "Lead Qualification" hardcoding**: Search entire codebase for hardcoded references
2. **Research query audit**: Map which queries go to Perplexity vs GPT and why
3. **Caching investigation**: Check if report components are being cached incorrectly
4. **Input parsing verification**: Ensure user inputs are properly parsed and contextualized
5. **Mobile UI testing**: Test report rendering on mobile devices
6. **Language strategy session**: Define clear, non-meta terminology for the tool

### Files to Investigate:
- `src/lib/assessment/research-engine.ts`
- `src/lib/assessment/report-sections-v3.ts` 
- `src/lib/assessment/curator/data-processor.ts`
- `src/services/deepReportGenerator.ts`
- All caching implementations
- Report template selection logic

### Test Cases Needed:
- Non-lead-qualification scenarios (delivery time, operational efficiency, etc.)
- Various ICP types with different challenges
- Mobile device rendering
- Research quality with strong vs. weak inputs

---

**Last Updated**: 2025-01-01
**Reporter**: Development Team
**Next Review**: Pending investigation results