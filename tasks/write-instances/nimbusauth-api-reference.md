# NimbusAuth API Reference

Base URL: `https://api.nimbusauth.dev/v1`

All requests and responses use JSON.

## Authenticate

Get an access token and a refresh token.

**Request**

```
POST /auth/login
Content-Type: application/json

{
  "api_key": "string, required",
  "email": "string, required",
  "password": "string, required"
}
```

**Response**

```json
{
  "access_token": "string",
  "refresh_token": "string",
  "expires_in": 3600
}
```

`expires_in` is the number of seconds until the access token expires.

## Get the current user

Return details about the user tied to the access token.

**Request**

```
GET /auth/me
Authorization: Bearer {access_token}
```

**Response**

```json
{
  "user_id": "string",
  "email": "string",
  "created_at": "2026-01-15T00:00:00Z"
}
```

## Refresh a token

Exchange a refresh token for a new access token.

**Request**

```
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "string, required"
}
```

**Response**

```json
{
  "access_token": "string",
  "expires_in": 3600
}
```

Refresh tokens don't expire. Store yours securely.

## Log out

Invalidate the current access token.

**Request**

```
POST /auth/logout
Authorization: Bearer {access_token}
```

**Response**

`204 No Content`

## Errors

NimbusAuth uses standard HTTP status codes.

| Code | Meaning |
|---|---|
| 400 | The request is missing a required field or has an invalid value |
| 401 | The access token is missing, expired, or invalid |
| 429 | You've sent too many requests. Wait before trying again |
