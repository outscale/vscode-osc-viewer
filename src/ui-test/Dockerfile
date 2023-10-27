FROM node:18-bullseye

RUN apt-get update -y \
    && apt-get install -y \
    xvfb \
    libnss3 \
    libatk1.0-0 \
    libcups2 \
    libgtk-3-dev \
    libatk-bridge2.0.0 \
    libasound2 \
    && apt clean \
    && mkdir -p /workspace

WORKDIR /workspace

