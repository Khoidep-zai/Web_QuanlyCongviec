#!/bin/bash

# ============================================
# Blue-Green Deployment Script
# ============================================

set -e

# Configuration
PROJECT_DIR="/opt/taskmanager"
DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker/docker-compose.yml"
NGINX_CONFIG="/etc/nginx/sites-available/taskmanager"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Starting Blue-Green Deployment${NC}"
echo -e "${BLUE}============================================${NC}"

# Step 1: Determine current environment
if docker ps | grep -q "taskmanager-backend-blue"; then
    CURRENT="blue"
    TARGET="green"
else
    CURRENT="green"
    TARGET="blue"
fi

echo -e "${GREEN}Current environment: $CURRENT${NC}"
echo -e "${GREEN}Target environment: $TARGET${NC}"

# Step 2: Pull latest images
echo -e "\n${BLUE}Pulling latest Docker images...${NC}"
cd "$PROJECT_DIR"
docker compose -f "$DOCKER_COMPOSE_FILE" pull

# Step 3: Start target environment
echo -e "\n${BLUE}Starting $TARGET environment...${NC}"
docker compose -f "$DOCKER_COMPOSE_FILE" up -d backend-$TARGET frontend-$TARGET

# Step 4: Wait for services to be ready
echo -e "\n${BLUE}Waiting for services to be healthy...${NC}"
sleep 30

# Check backend health
BACKEND_PORT=$(docker inspect taskmanager-backend-$TARGET | jq -r '.[0].NetworkSettings.Ports."5000/tcp"[0].HostPort')
echo "Checking backend health on port $BACKEND_PORT..."

for i in {1..10}; do
    if curl -f http://localhost:$BACKEND_PORT/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is healthy${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}✗ Backend health check failed${NC}"
        docker compose -f "$DOCKER_COMPOSE_FILE" logs backend-$TARGET
        exit 1
    fi
    echo "Attempt $i/10 failed, retrying..."
    sleep 5
done

# Step 5: Run database migrations
echo -e "\n${BLUE}Running database migrations...${NC}"
docker compose -f "$DOCKER_COMPOSE_FILE" exec -T backend-$TARGET npm run migrate

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Migration failed${NC}"
    docker compose -f "$DOCKER_COMPOSE_FILE" stop backend-$TARGET frontend-$TARGET
    exit 1
fi

# Step 6: Run smoke tests
echo -e "\n${BLUE}Running smoke tests...${NC}"
# Add your smoke tests here
curl -f http://localhost:$BACKEND_PORT/api/health || exit 1

# Step 7: Switch traffic (update Nginx)
echo -e "\n${BLUE}Switching traffic to $TARGET environment...${NC}"

# Update Nginx configuration
sudo sed -i "s/backend-$CURRENT:5000/backend-$TARGET:5000/g" "$NGINX_CONFIG"
sudo sed -i "s/frontend-$CURRENT:80/frontend-$TARGET:80/g" "$NGINX_CONFIG"

# Reload Nginx
sudo nginx -t && sudo nginx -s reload

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Nginx reload failed${NC}"
    # Rollback Nginx config
    sudo sed -i "s/backend-$TARGET:5000/backend-$CURRENT:5000/g" "$NGINX_CONFIG"
    sudo sed -i "s/frontend-$TARGET:80/frontend-$CURRENT:80/g" "$NGINX_CONFIG"
    sudo nginx -s reload
    exit 1
fi

echo -e "${GREEN}✓ Traffic switched to $TARGET${NC}"

# Step 8: Monitor for 2 minutes
echo -e "\n${BLUE}Monitoring $TARGET environment for 2 minutes...${NC}"
for i in {1..12}; do
    if ! curl -f http://localhost/health > /dev/null 2>&1; then
        echo -e "${RED}✗ Health check failed during monitoring${NC}"
        # Rollback
        sudo sed -i "s/backend-$TARGET:5000/backend-$CURRENT:5000/g" "$NGINX_CONFIG"
        sudo sed -i "s/frontend-$TARGET:80/frontend-$CURRENT:80/g" "$NGINX_CONFIG"
        sudo nginx -s reload
        exit 1
    fi
    echo "Check $i/12 passed"
    sleep 10
done

# Step 9: Stop old environment
echo -e "\n${BLUE}Stopping $CURRENT environment...${NC}"
docker compose -f "$DOCKER_COMPOSE_FILE" stop backend-$CURRENT frontend-$CURRENT

# Optional: Remove old containers
# docker compose -f "$DOCKER_COMPOSE_FILE" rm -f backend-$CURRENT frontend-$CURRENT

echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Active environment: $TARGET${NC}"
echo -e "${GREEN}============================================${NC}"

exit 0
