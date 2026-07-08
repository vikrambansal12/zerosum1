# Deploys the Express backend (see backend/server.js) together with the
# static frontend it also serves (see frontend/), since
# server.js references the static folder via a relative "../frontend"
# path -- both need to keep that same sibling-folder relationship inside the image.
FROM node:22-slim

WORKDIR /app

# Install dependencies first (separate layer, so `npm install` is only
# re-run when package*.json actually changes, not on every code edit).
COPY backend/package.json backend/package-lock.json backend/
RUN cd backend && npm install --omit=dev

# Now bring in the actual application code.
COPY backend/ backend/
COPY frontend/ frontend/

WORKDIR /app/backend
EXPOSE 3001
CMD ["node", "server.js"]
