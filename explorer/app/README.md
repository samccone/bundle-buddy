[![Build Status](https://travis-ci.org/samccone/bundle-buddy.svg?branch=bundle-explorer)](https://travis-ci.org/samccone/bundle-buddy)

# Deploy

For the `gcloud` command you will need to install: https://cloud.google.com/sdk/docs/#install_the_latest_cloud_tools_version_cloudsdk_current_version

    yarn build
    cp -r build/* deploy/bundle-buddy/www
    cd deploy/bundle-buddy
    gcloud app deploy --project=bundle-buddy
