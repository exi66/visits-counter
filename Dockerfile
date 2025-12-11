# Use the official Node.js image as the base image
FROM node:24-alpine
# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install application dependencies
RUN npm install

RUN npm install -g knex

# Copy the rest of the application code
COPY . .

# RUN knex migrate:up

# Expose the port the Express app runs on
EXPOSE 3000

# Command to run the application when the container starts
CMD ["npm", "start"]