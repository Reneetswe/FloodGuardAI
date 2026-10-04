# FloodGuardAI

FloodGuardAI is an AI-powered early warning system for urban flood risk monitoring and response in Gaborone, Botswana. It combines live sensor telemetry, predictive analytics, community-reported flood signals, manual image uploads, and alert delivery into a single operational dashboard.

## Overview

This project is designed to help city agencies and communities detect flood risks earlier and respond before damage escalates. The platform includes:

- Live flood risk monitoring dashboard
- IoT / sensor simulation data for drainage, pump, and culvert conditions
- AI-driven flood risk predictions
- Social media/community signal monitoring
- Manual image upload analysis workflow
- SMS alert simulation and delivery logging
- Real-time updates via Socket.IO

## Tech Stack

- Frontend: React + Vite
- Styling: Tailwind CSS
- Backend: Node.js + Express
- Real-time communication: Socket.IO
- Database: SQLite (primary runtime fallback), Neon/PostgreSQL-ready configuration
- SMS: Africa's Talking integration (optional)
- Maps: Leaflet

## Project Structure

```bash
.
├── public/
│   └── uploads/
├── server/
│   └── index.cjs
├── src/
│   ├── lib/
│   ├── pages/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
├── render.yaml
├── tailwind.config.js
├── update-images.cjs
├── vercel.json
├── vite.config.js
├── UPLOAD_FLOW_ANALYSIS.md
└── README.md
```

## Features

### Live monitoring dashboard
The dashboard shows current flood conditions, risk levels, affected areas, and sensor readings across multiple urban locations.

### Predictive analytics
The backend simulates predictive flood models and emits changing probabilities by area, letting the frontend visualize risk hotspots and escalation windows.

### Community intelligence
The app supports social media and citizen report ingestion, including sample posts, manual uploads, and risk scoring based on text or uploaded imagery.

### Alerting
Users can trigger SMS alerts with phone numbers, flood risk, ETA, and response actions. The system logs alert events and supports Africa's Talking credentials when configured.

### Real-time updates
The frontend is connected to live Socket.IO events for sensor, prediction, and risk changes.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Environment setup

Copy the example environment file and update values as needed:

```bash
cp .env.example .env
```

Example values:

```env
PORT=5001
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
AFRICASTALKING_API_KEY=
AFRICASTALKING_USERNAME=
VITE_AI_API_BASE_URL=http://localhost:8000
```

## Running the app

### Development mode

```bash
npm run dev
```

This starts:

- the Express server on the configured port
- the Vite frontend client

### Production build

```bash
npm run build
```

### Start production server

```bash
npm start
```

## API Endpoints

The backend exposes several endpoints for monitoring and alerting:

- `GET /api/health` — health check
- `GET /api/sensors` — live sensor data
- `GET /api/predictions` — flood predictions
- `GET /api/overall` — aggregate risk summary
- `GET /api/alerts` — alert history
- `GET /api/social-posts` — social reports
- `POST /api/manual-upload` — upload a citizen image/report
- `POST /api/send-alert` — send SMS alert
- `POST /api/log-sms` — save alert log entry

## Deployment

This repository includes deployment configuration for hosting platforms such as Render and Vercel.

### Render
Use the included `render.yaml` config.

### Vercel
Use the included `vercel.json` and standard Vite build settings.

## Notes

- The app currently uses SQLite for alert logging while the project also includes a Neon/PostgreSQL connection pattern for future database-backed deployment.
- The data is intentionally demo-driven to showcase the flood monitoring workflow in a hackathon or prototype context.
- Image uploads are stored in `public/uploads`.

## License

This project is licensed under the ISC License.

## Acknowledgements

Built for flood resilience and early-warning innovation in Botswana, with a focus on practical civic monitoring and rapid response.
