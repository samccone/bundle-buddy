set -e

  yarn build
  cp -r build/* deploy/bundle-buddy/www
  cd deploy/bundle-buddy
  gcloud app deploy --project=bundle-buddy
