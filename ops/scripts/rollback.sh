#!/bin/bash

# ============================================
# Rollback Script
# ============================================

set -e

# Configuration
PROJECT_DIR="/opt/taskmanager"
DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker/docker-compose.yml"
NGINX_CONFIG="/etc/nginx/sites-available/taskmanager"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}============================================${NC}"
echo -e "${RED}Starting Rollback Process${NC}"
echo -e "${RED}============================================${NC}"

# Determine current/previous environment
if docker ps | grep -q "taskmanager-backend-green"; then
    CURRENT="green"
    PREVIOUS="blue"
else
    CURRENT="blue"
    PREVIOUS="green"
fi

echo -e "${YELLOW}Current environment: $CURRENT${NC}"
echo -e "${YELLOW}Rolling back to: $PREVIOUS${NC}"

# Check if previous environment exists
if ! docker ps -a | grep -q "taskmanager-backend-$PREVIOUS"; then
    echo -e "${RED}✗ Previous environment not found${NC}"
    exit 1
fi

# Start previous environment
echo -e "\n${YELLOW}Starting $PREVIOUS environment...${NC}"
cd "$PROJECT_DIR"
docker compose -f "$DOCKER_COMPOSE_FILE" start backend-$PREVIOUS frontend-$PREVIOUS

# Wait for services
sleep 20

# Health check
BACKEND_PORT=$(docker inspect taskmanager-backend-$PREVIOUS | jq -r '.[0].NetworkSettings.Ports."5000/tcp"[0].HostPort')
if curl -f http://localhost:$BACKEND_PORT/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Previous environment is healthy${NC}"
else
    echo -e "${RED}✗ Previous environment health check failed${NC}"
    exit 1
fi

# Switch traffic back
echo -e "\n${YELLOW}Switching traffic back to $PREVIOUS...${NC}"
sudo sed -i "s/backend-$CURRENT:5000/backend-$PREVIOUS:5000/g" "$NGINX_CONFIG"
sudo sed -i "s/frontend-$CURRENT:80/frontend-$PREVIOUS:80/g" "$NGINX_CONFIG"
sudo nginx -t && sudo nginx -s reload

# Stop current (failed) environment
echo -e "\n${YELLOW}Stopping $CURRENT environment...${NC}"
docker compose -f "$DOCKER_COMPOSE_FILE" stop backend-$CURRENT frontend-$CURRENT

echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}Rollback completed successfully!${NC}"
echo -e "${GREEN}Active environment: $PREVIOUS${NC}"
echo -e "${GREEN}============================================${NC}"

exit 0
