# Use the latest LTS version of Node.js
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application files
COPY . .

# Expose the ports your app runs on (both 5173 for frontend and 3000 for internal app)
EXPOSE 5173

# Define the command to run your app
CMD ["npm", "run", "dev"]
