FROM node:18-bullseye@sha256:0d9e9a8dcd5a83ea737ed92227a6591a31ad70c8bb722b0c51aff7ae23a88b6a

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

