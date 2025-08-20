# Docker Image Validation Tool

A command-line tool for validating Docker images with the `!docker-image-validation` command.

## Overview

This tool validates Docker images by checking:
- Image existence in registries
- Image metadata and tags
- Security vulnerabilities (optional)
- Compliance with naming conventions

## Usage

```bash
python docker_validator.py !docker-image-validation <image-list>
```

## Supported Images

The tool can validate images from various registries including:
- Docker Hub
- Private registries
- Cloud registries (AWS ECR, GCR, Azure ACR)

## Example

```bash
python docker_validator.py !docker-image-validation \
  adw/adw-mssql \
  aia/cpae-tf \
  aia/kidan \
  aia/opt-eng \
  aia/smart-comms
```
