#!/usr/bin/env bash
set -e

REGISTRY="$1"
IMAGE_NAME="$2"
CONTAINER_NAME="$3"
APP_PORT="$4"
HOST_PORT="$5"

IMAGE="$REGISTRY/$IMAGE_NAME:latest"

echo "Pulling latest image..."
docker pull "$IMAGE"

echo "Stopping old container (if exists)..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo "Starting new container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$HOST_PORT:$APP_PORT" \
  --restart unless-stopped \
  "$IMAGE"

echo "Waiting for container health..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ "$ATTEMPT" -lt "$MAX_ATTEMPTS" ]; do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "starting")

  if [ "$STATUS" = "healthy" ]; then
    echo "✓ App is healthy!"
    exit 0
  fi

  ATTEMPT=$((ATTEMPT + 1))
  echo "Attempt $ATTEMPT/$MAX_ATTEMPTS — status: $STATUS"
  sleep 2
done

echo "✗ App failed to become healthy"
docker logs "$CONTAINER_NAME"
exit 1
