import { GITHUB_OWNER, GITHUB_REPO } from '../constants'
import type { Track } from '../utils/api'

export const QUICKSTART_CONTENT_FALLBACK = `# NimbusAuth Quick Start Guide

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

Send a POST request to /auth/logout to end your session.`

export const API_REFERENCE_CONTENT_FALLBACK = `# List active sessions

Get a list of a user's active sessions, including device and location details for each one.

## Authentication

Requires a valid access token.

Authorization: Bearer {access_token}

## Request

GET https://api.nimbusauth.dev/v1/auth/sessions

### Query parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| \`limit\` | integer | No | Maximum number of sessions to return. Defaults to 20 if omitted. Accepts values from 1 to 100. |
| \`active_only\` | boolean | No | Return only sessions that haven't expired. Defaults to \`true\`. Set to \`false\` to include expired sessions. |

## Response

A successful request returns a 200 status and a list of session objects.

### Response fields

| Field | Type | Description |
|---|---|---|
| \`session_id\` | string | Unique identifier for the session. |
| \`device\` | string | The device or browser the session was created from. |
| \`ip_address\` | string | The IP address the session was created from. |
| \`created_at\` | string | When the session was created, in ISO 8601 format. |
| \`last_active_at\` | string | When the session was last used, in ISO 8601 format. |
| \`current\` | boolean | Whether this is the session making the current request. |

## Example

**Request**

GET https://api.nimbusauth.dev/v1/auth/sessions
Authorization: Bearer ey.abc123

**Response**

{
  "error": "invalid_request",
  "message": "limit is required"
}

## Error codes

| Code | Meaning |
|---|---|
| \`401\` | The access token is missing, expired, or invalid. |
| \`400\` | The request includes an invalid \`limit\` value. \`limit\` must be a number between 1 and 100. |`

export const TRACKS: Track[] = [
  {
    id: 'quickstart',
    title: 'Quick start guide',
    description: 'A getting-started guide for the authentication API.',
    seedDraftPath: 'tasks/write-instances/nimbusauth_quick-start.md',
    seedDraftBranch: 'write/seed-quick-start',
    seedPrUrl: 'https://github.com/sr-docs/documentation-ecosystem-playground/pull/47',
    seedPrNumber: '47',
    relatedReferenceUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/main/tasks/write-instances/nimbusauth-api-reference.md`,
    referenceLabel: 'NimbusAuth API Reference',
    fallbackContent: QUICKSTART_CONTENT_FALLBACK,
    plan: {
      title: 'Authentication API Documentation',
      problem: "Users can't integrate with the authentication API because documentation doesn't exist.",
      audience: 'Developers integrating with the authentication API',
      documentationNeeded: 'Quick start guide, API reference, and three integration examples',
      successCriteria: 'Developers can authenticate and make their first API request without support.',
    },
  },
  {
    id: 'api-reference',
    title: 'API reference',
    description: 'Endpoint reference documentation for listing active sessions.',
    seedDraftPath: 'tasks/write-instances/seed-api-reference.md',
    seedDraftBranch: 'write/seed-api-reference',
    seedPrUrl: 'https://github.com/sr-docs/documentation-ecosystem-playground/pull/45',
    seedPrNumber: '45',
    relatedReferenceUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/main/reference-code/routes/sessions.js`,
    referenceLabel: 'Source: sessions.js route handler',
    fallbackContent: API_REFERENCE_CONTENT_FALLBACK,
    plan: {
      title: 'Session Listing Endpoint Reference',
      problem: "Developers can't tell which query parameters are required when listing active sessions.",
      audience: 'Developers integrating session management into their app',
      documentationNeeded: 'A complete endpoint reference: parameters, response fields, error codes, and a worked example',
      successCriteria: 'A developer can call the endpoint correctly on the first try, with no guessing.',
    },
  },
]

export function getTrack(id: string): Track {
  return TRACKS.find((t) => t.id === id) || TRACKS[0]
}
