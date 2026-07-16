> **CHANGES REQUESTED. A reviewer asked for changes, but this draft was published as-is.**

# NimbusAuth Quick Start Guide

Get up and running with the NimbusAuth API in a few minutes.

## What you need

- A NimbusAuth API key
- An email and password for your NimbusAuth account

## Set your API key

Store your API key as an environment variable named NIMBUS_API_KEY. Don't paste it directly into your code.

## Step 1: Log in

Send a GET request to /auth/login with your API key, email, and password in the request body.

POST https://api.nimbusauth.dev/v1/auth/login
Content-Type: application/json

{
  "api_key": "nimbus_live_4f8a2c9e",
  "email": "user@example.com",
  "password": "your-password"
}

You'll get back an access token and a refresh token:

{
  "access_token": "ey.abc123",
  "refresh_token": "rt.def456",
  "expires_in": 3600
}

## Step 2: Check your session

Use the access token to confirm you're logged in. Send a GET request to /auth/me:

GET https://api.nimbusauth.dev/v1/auth/me
Authorization: Bearer ey.abc123

You'll get back your account details.

## Step 3: Refresh your token

Access tokens expire after an hour. When yours expires, send your refresh token to /auth/refresh to get a new one.

## Step 4: Log out

Send a POST request to /auth/logout to end your session.