# Workspace

## Overview

Emergency Call Emotion Analysis System (E.C.E.A.S) — a professional dark-themed emergency operations dashboard for real-time call monitoring, speech emotion recognition, keyword detection, and analytics.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + Recharts
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Date formatting**: date-fns

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/             # Express API server (backend)
│   └── emergency-dashboard/    # React + Vite frontend
├── lib/
│   ├── api-spec/               # OpenAPI spec + Orval codegen config
│   ├── api-client-react/       # Generated React Query hooks
│   ├── api-zod/                # Generated Zod schemas from OpenAPI
│   └── db/                     # Drizzle ORM schema + DB connection
├── scripts/                    # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

### Dashboard (/)
- Real-time overview stats: total calls, active connections, escalated incidents, high-risk alerts
- Recent calls table with emotion and risk badges
- Emotion distribution bars
- System status panel

### Live Call Monitor (/live-call)
- Active call queue panel
- Selected call detail view: caller info, emotion badge, emotion timeline chart
- Live transcript with highlighted emergency keywords
- Escalate / End Call action buttons
- Flashing red alert banner for critical calls

### Audio Upload (/audio-upload)
- Upload audio files (WAV, MP3) OR use microphone tab
- Language selector: English, Tamil, Hindi
- Simulated ML emotion analysis with confidence scores
- Emotion breakdown bar chart
- Transcript with highlighted emergency keywords
- Red alert if high-risk (stress/pain + emergency keyword detected)

### Analytics (/analytics)
- 24H emotion frequency trend line chart
- Call volume vs risk bar chart
- Emotion distribution pie chart
- Peak stress bar chart

## Backend API Routes

- `GET /api/healthz` - Health check
- `POST /api/emotion/analyze` - Simulate ML emotion analysis from transcript
- `POST /api/emotion/keywords` - Detect emergency keywords in transcript
- `GET /api/calls` - List all calls (seeded with sample data)
- `POST /api/calls` - Create new call
- `GET /api/calls/:id` - Get single call
- `PATCH /api/calls/:id` - Update call (escalate, change status)
- `GET /api/analytics/summary` - Analytics summary stats
- `GET /api/analytics/emotion-trends` - 24h emotion trend data
- `GET /api/analytics/call-volume` - 24h call volume data

## Emotions Detected
- stressed, drunk, abusive, pain, calm, unknown

## Emergency Keywords
- help, attack, accident, fire, kill, danger, emergency, hurt, bleeding, trapped, abuse, threat, assault
- Tamil/Hindi equivalents also supported

## Risk Levels
- low, medium, high, critical
