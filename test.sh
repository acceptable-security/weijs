#!/bin/bash

# Run ESLINT
eslint --ignore-path .eslintignore .

# Remove old code coverage
rm -rf src-cov

# Generate new code coverage
./node_modules/.bin/jscover src src-cov

# Load the covered src
mv src src-orig
mv src-cov src

# Run mocha and output to coveralls
./node_modules/mocha/bin/mocha -R mocha-lcov-reporter | ./node_modules/coveralls/bin/coveralls.js

# Clean up the source
rm -rf src
mv src-orig src