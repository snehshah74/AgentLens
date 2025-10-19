#!/bin/bash

# Fix for Node.js v24 networking issue
export NODE_OPTIONS="--dns-result-order=ipv4first"

# Start Next.js dev server with hostname binding
npm run dev -- --hostname 0.0.0.0 --port 3000

