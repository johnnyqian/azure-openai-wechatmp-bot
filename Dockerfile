FROM node:18-alpine AS base
EXPOSE 8000
WORKDIR /app
COPY . .
RUN npm install
CMD [ "npm", "run", "start" ]
