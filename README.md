# FloodGuardAI

FloodGuardAI is an AI-powered early warning system for urban flood risk monitoring and response in Gaborone, Botswana. The platform combines live sensor telemetry, predictive analytics, community reports, and alert workflows to help city agencies and communities detect flood risks earlier and respond before damage escalates.

## Overview

FloodGuardAI is designed for real-time flood monitoring and decision support in urban environments. It helps teams:

- monitor drainage, pump, and culvert conditions in near real time
- visualize flood risk hotspots across city areas
- track predictive flood probability and escalation windows
- ingest community and social media flood reports
- analyze uploaded flood images and citizen reports
- simulate SMS alerts and log delivery events
- surface live system updates through WebSockets

## Key Features

### Live monitoring dashboard
The dashboard shows current flood conditions, risk levels, infrastructure health, and sensor readings across multiple urban locations.

### Predictive analytics
The backend simulates predictive models and emits changing probabilities by area, enabling the frontend to visualize risk hotspots and emerging flood scenarios.

### Community intelligence
The app supports social media and community-report ingestion, including sample posts, manual uploads, and risk scoring based on text or uploaded imagery.

### Alerting workflow
Users can trigger SMS alerts with phone numbers, flood risk, ETA, and response actions. The system logs alert events and supports Africa's Talking when credentials are configured.

### Real-time updates
The frontend is connected to live Socket.IO events for sensor, prediction, and risk changes.

## Tech Stack

- Frontend: React + Vite
- Styling: Tailwind CSS
- Backend: Node.js + Express
- Real-time communication: Socket.IO
- Database: SQLite (runtime fallback), with Neon/PostgreSQL-ready configuration
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
├── README.md
└── data.db
```

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

Example configuration:

```env
PORT=5001
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
AFRICASTALKING_API_KEY=
AFRICASTALKING_USERNAME=
VITE_AI_API_BASE_URL=http://localhost:8000
```

## Running the Application

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

The backend exposes the following API routes:

- `GET /api/health` — health check
- `GET /api/sensors` — live sensor data
- `GET /api/predictions` — flood predictions
- `GET /api/overall` — aggregate risk summary
- `GET /api/alerts` — alert history
- `GET /api/social-posts` — social reports
- `GET /api/social-posts/count` — total social report count
- `POST /api/manual-upload` — upload a citizen image/report
- `POST /api/send-alert` — send an SMS alert
- `POST /api/log-sms` — save alert log entry
- `POST /api/social-posts/scan` — scan and return sample social reports

## Deployment

This repository includes deployment configuration for hosting platforms such as Render and Vercel.

### Render
Use the included `render.yaml` configuration.

### Vercel
Use the included `vercel.json` file and standard Vite build settings.

## Notes

- The app currently uses SQLite for alert logging while also including a Neon/PostgreSQL-ready connection pattern for future database-backed deployment.
- The data is intentionally demo-driven to showcase the flood monitoring workflow in a hackathon or prototype context.
- Image uploads are stored in `public/uploads`.
- The project is useful as a prototype for civic technology, emergency response planning, and urban flood resilience monitoring.

## License

This project is licensed under the ISC License.

## Acknowledgements

Built for flood resilience and early-warning innovation in Botswana, with a focus on practical civic monitoring and rapid response.

## Contributing

Contributions are welcome for improvements to the flood risk model, UI design, alert workflow, or deployment configuration.

## Project Goal

FloodGuardAI demonstrates how public-sector decision tools can combine data, AI, and citizen reporting to improve flood awareness and emergency readiness in urban communities.
