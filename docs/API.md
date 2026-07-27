# Goal Compass API Reference

Base URL: `/api`

## Authentication

### POST /api/auth/register
Register a new user.
```json
{ "name": "string", "email": "string", "password": "string" }
```
Returns: `{ user: User, token: string }`

### POST /api/auth/login
Login with existing credentials.
```json
{ "email": "string", "password": "string" }
```
Returns: `{ user: User, token: string }`

### GET /api/auth/profile
Get current user profile. Requires JWT.

### PATCH /api/auth/profile
Update profile. Requires JWT.
```json
{ "name?": "string", "avatar?": "string" }
```

## Teams

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/teams | List teams |
| POST | /api/teams | Create team |
| GET | /api/teams/:id | Get team detail |
| PATCH | /api/teams/:id | Update team |
| DELETE | /api/teams/:id | Delete team |
| POST | /api/teams/:id/members | Add member |
| DELETE | /api/teams/:id/members/:userId | Remove member |
| GET | /api/teams/:id/objectives | Team objectives |

## Cycles

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/cycles | List cycles |
| GET | /api/cycles/current | Get active cycle |
| POST | /api/cycles | Create cycle |
| GET | /api/cycles/:id | Get cycle detail |
| PATCH | /api/cycles/:id | Update cycle |
| DELETE | /api/cycles/:id | Delete cycle |
| PATCH | /api/cycles/:id/activate | Activate (draft→active) |
| PATCH | /api/cycles/:id/close | Close (active→closed) |
| GET | /api/cycles/:id/summary | Cycle summary |

## Objectives

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/objectives | List (filter: cycleId, teamId, ownerId, status, search) |
| POST | /api/objectives | Create objective |
| GET | /api/objectives/:id | Get detail |
| PATCH | /api/objectives/:id | Update |
| DELETE | /api/objectives/:id | Delete |

## Key Results

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/key-results | List (filter: objectiveId, ownerId) |
| POST | /api/key-results | Create key result |
| GET | /api/key-results/:id | Get detail |
| PATCH | /api/key-results/:id | Update |
| DELETE | /api/key-results/:id | Delete |

## Check-Ins

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/check-ins | List (filter: keyResultId) |
| POST | /api/check-ins | Create (updates KR progress) |
| GET | /api/check-ins/:id | Get detail |
| DELETE | /api/check-ins/:id | Delete (recalculates) |

## Initiatives

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/initiatives | List (filter: keyResultId, assigneeId, status) |
| POST | /api/initiatives | Create |
| PATCH | /api/initiatives/:id | Update |
| DELETE | /api/initiatives/:id | Delete |

## Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/dashboard | Overview (current cycle KPIs, objectives, activity, team progress) |

## Users

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/users | Search users (?search=&teamId=) |
