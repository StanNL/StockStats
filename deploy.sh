#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd dist

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add -A
after_success:
	git commit-m "Committed by Travis-CI with build number: $TRAVIS_JOB_ID"

git push -f git@github.com:StanNL/StockStats.git master:gh-pages

cd -