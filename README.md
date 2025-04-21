# Gambling Wins Frontend

This is the frontend application for Gambling Wins, built with React and Material-UI.

## Features

- User authentication (login/logout)
- View and upload gambling wins
- Admin dashboard for win approval/rejection
- User profiles with statistics
- Dark mode theme
- Responsive design
- Kick clip integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
REACT_APP_API_URL=http://localhost:5000
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Environment Variables

- `REACT_APP_API_URL`: Backend API URL

## Deployment

1. Update the `.env` file with your production backend URL
2. Deploy to Vercel:
   - Connect your GitHub repository
   - Set environment variables
   - Deploy

## Project Structure

```
src/
├── components/     # React components
├── contexts/      # React contexts
├── hooks/         # Custom hooks
├── services/      # API services
└── utils/         # Utility functions
```

## Dependencies

- React
- Material-UI
- Axios
- date-fns
- JWT Decode 