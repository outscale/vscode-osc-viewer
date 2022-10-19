#!/bin/bash

# Start Xvfb ffor the display
Xvfb -ac :99 -screen 0 1920x1080x16 &

# Make all files accessile to the node user
chown -R node:node /workspace

# Log as node user (1000) and start the test
su node -c "export DISPLAY=:99; npm run-script ui-test"