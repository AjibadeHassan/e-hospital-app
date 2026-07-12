FROM node:18-alpine

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
