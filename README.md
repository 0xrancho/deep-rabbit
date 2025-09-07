# SEP ASSESS - Live Elicitation Agent for Prospect Discovery

## Overview
SEP ASSESS is an advanced live elicitation platform designed for deep prospect discovery and qualification. It uses intelligent conversation flows to uncover hidden needs, pain points, and opportunities that traditional assessment tools miss.

## Key Features

### 🎯 Intelligent Elicitation
- **Dynamic Questioning**: Adapts questions based on prospect responses
- **Deep Discovery**: Uncovers underlying business challenges and opportunities
- **Context-Aware**: Maintains conversation context for natural flow
- **Multi-Path Exploration**: Explores multiple discovery paths simultaneously

### 📊 Prospect Intelligence
- **Real-time Qualification**: Scores prospects based on multiple dimensions
- **Need Mapping**: Maps discovered needs to solution capabilities
- **Opportunity Sizing**: Quantifies potential value and urgency
- **Stakeholder Analysis**: Identifies decision makers and influencers

### 🚀 Key Differentiators
- **Live Conversation Engine**: Not just forms, but intelligent dialogue
- **Hidden Need Discovery**: Surfaces needs prospects don't know they have
- **Progressive Disclosure**: Reveals insights as trust builds
- **Actionable Intelligence**: Delivers sales-ready intelligence reports

## Project Structure

```
sep-assess/
├── src/
│   ├── components/         # UI components
│   │   ├── assessment/     # Assessment flow components
│   │   └── ui/            # Shared UI components
│   ├── lib/
│   │   ├── assessment/    # Elicitation logic & intelligence
│   │   └── utils/         # Utility functions
│   ├── pages/             # Application pages
│   └── services/          # API and external services
├── public/                # Static assets
└── package.json          # Dependencies
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
cd sep-assess

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

### Environment Variables
Create a `.env` file with:
```env
# API Keys
VITE_OPENAI_API_KEY=your_openai_key
VITE_PERPLEXITY_API_KEY=your_perplexity_key

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Feature Flags
VITE_ENABLE_LIVE_ELICITATION=true
VITE_ENABLE_DEEP_DISCOVERY=true
```

## Customization Guide

### Modifying Elicitation Behavior
The elicitation agent behavior can be customized in:
- `/src/lib/assessment/elicitation-engine.ts` - Core elicitation logic
- `/src/lib/assessment/discovery-patterns.ts` - Discovery patterns and strategies
- `/src/lib/assessment/qualification-rules.ts` - Prospect scoring rules

### Adjusting Question Flows
- `/src/components/assessment/Step*.tsx` - Individual assessment steps
- `/src/data/questionBank.ts` - Question repository
- `/src/lib/assessment/flow-controller.ts` - Flow control logic

### Customizing Reports
- `/src/lib/assessment/report-generator.ts` - Report generation
- `/src/lib/assessment/intelligence-compiler.ts` - Intelligence synthesis

## Key Differences from GABI ASSESS

| Feature | GABI ASSESS | SEP ASSESS |
|---------|-------------|------------|
| **Focus** | AI Transformation Roadmap | Live Prospect Discovery |
| **Method** | Structured Assessment | Dynamic Elicitation |
| **Output** | Implementation Plan | Discovery Intelligence |
| **Target** | Business Leaders | Sales Teams |
| **Intelligence** | Solution Matching | Need Uncovering |

## API Documentation

### Elicitation Engine
```typescript
interface ElicitationEngine {
  startSession(context: ProspectContext): Session
  processResponse(response: string): NextQuestion
  generateInsight(): DiscoveryInsight
  completeDiscovery(): ProspectIntelligence
}
```

### Discovery Patterns
```typescript
interface DiscoveryPattern {
  trigger: ResponseTrigger
  exploration: ExplorationStrategy
  depth: number
  branches: DiscoveryBranch[]
}
```

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support, email support@sepassess.com or open an issue in the GitHub repository.

## Acknowledgments
- Built on the foundation of advanced elicitation techniques
- Powered by state-of-the-art language models
- Inspired by consultative selling methodologies