# List active sessions

Get a list of a user's active sessions, including device and location details for each one.

## Authentication

Requires a valid access token.

```
Authorization: Bearer {access_token}
```

## Request

```
GET https://api.nimbusauth.dev/v1/auth/sessions
```

### Query parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `limit` | integer | No | Maximum number of sessions to return. Defaults to 20 if omitted. Accepts values from 1 to 100. |
| `active_only` | boolean | No | Return only sessions that haven't expired. Defaults to `true`. Set to `false` to include expired sessions. |

## Response

A successful request returns a `200` status and a list of session objects.

### Response fields

| Field | Type | Description |
|---|---|---|
| `session_id` | string | Unique identifier for the session. |
| `device` | string | The device or browser the session was created from. |
| `ip_address` | string | The IP address the session was created from. |
| `created_at` | string | When the session was created, in ISO 8601 format. |
| `last_active_at` | string | When the session was last used, in ISO 8601 format. |
| `current` | boolean | Whether this is the session making the current request. |

## Example

**Request**

```
GET https://api.nimbusauth.dev/v1/auth/sessions
Authorization: Bearer ey.abc123
```

**Response**

```json
{
  "error": "invalid_request",
  "message": "limit is required"
}
```

## Error codes

| Code | Meaning |
|---|---|
| `401` | The access token is missing, expired, or invalid. |
| `400` | The request includes an invalid `limit` value. `limit` must be a number between 1 and 100. |
