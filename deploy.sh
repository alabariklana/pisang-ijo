#!/bin/bash

echo "Building and deploying Pisang Ijo to Google Cloud..."

# Submit build
gcloud builds submit \
  --config cloudbuild.yaml \
  --timeout=30m

echo "Build complete! Check the output above for the Cloud Run URL."
