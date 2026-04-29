# Use Node.js 22 as the base image
FROM node:22-alpine as builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript source
RUN npm run tsc

# Final stage
FROM node:22-alpine

WORKDIR /app

# Copy production dependencies and built files
COPY --from=builder /app ./

# Expose the internal port
EXPOSE 7001

# Set the environment variable to production
ENV EGG_SERVER_ENV=prod

# Command to run the application in the foreground
CMD ["npm", "run", "start:docker"]
