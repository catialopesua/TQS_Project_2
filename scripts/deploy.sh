#!/usr/bin/env bash
set -e

REGISTRY="$1"
IMAGE_NAME="$2"
CONTAINER_NAME="$3"
APP_PORT="$4"
HOST_PORT="$5"

echo "Pulling latest image..."
docker pull "$REGISTRY/$IMAGE_NAME:latest"

echo "Stopping old container..."
docker stop "$CONTAINER_NAME" || true
docker rm "$CONTAINER_NAME" || true

echo "Starting new container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$HOST_PORT:$APP_PORT" \
  --restart unless-stopped \
  --health-interval=30s \
  --health-timeout=3s \
  --health-retries=3 \
  --health-start-period=40s \
  "$REGISTRY/$IMAGE_NAME:latest"

echo "Waiting for health..."
for i in {1..30}; do
  if docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" | grep -q healthy; then
    echo "✓ App is healthy!"
    exit 0
  fi
  sleep 2
done

echo "✗ App failed"
docker logs "$CONTAINER_NAME"
exit 1
