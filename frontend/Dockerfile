FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# Replace /api with http://localhost:8000 in the built bundle (accessible from host browser)
RUN find /app/dist -name "*.js" -exec sed -i 's|"/api"|"http://localhost:8000"|g' {} +

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm install -g serve
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
