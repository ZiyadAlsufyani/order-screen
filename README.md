# Order Screen

Point of sale interface for creating and submitting new orders.

## Features
- Order entry interface
- Real-time communication with kitchen and home screens
- Integration with RTI Connext DDS messaging system

## Setup
1. Install dependencies:
```bash
npm install
```
2. Start the development environment:
```bash
# Start both server and application
npm run start:all

# Or start individually:
npm run start:server  # Starts DDS server
npm run start:app     # Starts Electron app
```

## Building
```bash
# Build for current platform
npm run build

# Platform specific builds
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```