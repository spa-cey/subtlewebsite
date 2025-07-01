#!/bin/bash

# Test script to refresh tokens for the macOS app
# The macOS app should call the refresh endpoint when it detects an expired token

echo "Testing token refresh for macOS app..."

# You'll need to provide the refresh token from the macOS app
REFRESH_TOKEN="$1"

if [ -z "$REFRESH_TOKEN" ]; then
    echo "Usage: ./test-refresh-for-mac.sh <refresh_token>"
    echo "Get the refresh token from the macOS app's keychain"
    exit 1
fi

# Call the refresh endpoint
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}" \
  -v

echo -e "\n\nIf successful, update the macOS app with the new tokens returned above."