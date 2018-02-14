FROM node:6.9.4
ENV PORT 8080

# Copy source code
COPY . /app

# Change working directory
WORKDIR /app

# Install dependencies
RUN npm install

# Launch application
CMD ["node","bin/www"]
