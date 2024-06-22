# API Documentation

## Table of Contents

- [A. AUTH](#a-auth)
  - [1. Signup](#1-signup)
  - [2. Auth Login](#2-auth-login)
  - [3. Invite User](#3-invite-user)
  - [4. Forgot Password Request](#4-forgot-password-request)
  - [5. Change User Password](#5-change-user-password)
  - [6. Update User Password](#6-update-user-password)
  - [7. Delete User](#7-delete-user)
- [B. ORGANIZATION](#b-organization)
  - [1. Create Organization](#1-create-organization)
  - [2. Update Organization](#2-update-organization)
  - [3. Select Organization](#3-select-organization)
  - [4. Retrieve Organization Details](#4-retrieve-organization-details)
- [C. DEPARTMENTS](#c-departments)
  - [1. Get Departments by Organization](#1-get-departments-by-organization)
  - [2. Get Department Details](#2-get-department-details)

## A. AUTH

### 1. Signup

**Endpoint**: `POST /api/v1/auth/signup`

This endpoint allows users to sign up for a new account.

**Request Body Parameters:**

- `name` (string, required): The name of the user.
- `email` (string, required): The email address of the user.
- `password` (string, required): The password for the new account.

**Usage:**

- Provide the user's name, email and password in the request body to to receive a verification email.
- If there are any missing fields, the response will include a message and an array of the missing fields.

```json
{
  "message": "Invalid email or password",
  "missingFields": ["email", "password"],
  "success": false
}
```

**Response:**

```json
{
  "userId": "string",
  "token": "string"
}
```

### 2. Auth Login

**Endpoint**: `POST /api/v1/auth/login`

This endpoint allows users to log in and obtain an authentication token.

**Request Body Parameters:**

- `email` (string): The email address of the user.
- `password` (string): The password of the user.

**Example:**

```json
{
  "email": "user@example.com",
  "password": "********"
}
```

**Response:**

```json
{
  "message": "string",
  "success": true,
  "token": "string",
  "user": "object"
}
```

**Usage:**

- Provide the user's email and password in the request body to obtain an authentication token.
- If the login attempt is unsuccessful, the response will include a message and an array of missing fields.

```json
{
  "message": "Invalid email or password",
  "missingFields": ["email", "password"],
  "success": false
}
```

### 3. Invite User

**Endpoint**: `POST /api/v1/auth/invite-user/:id`

This endpoint allows you to invite a user.

**Request Body Parameters:**

- `name` (string, required): The name of the user to be invited.
- `email` (string, required): The email address of the user to be invited.
- `userType` (string, required): The type of user to be invited.

**Response (200 - OK):**

```json
{
  "message": {
    "type": "string"
  },
  "success": {
    "type": "boolean"
  },
  "user": {
    "id": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "password": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "isVerified": {
      "type": "boolean"
    },
    "verificationToken": {
      "type": ["string", "null"]
    },
    "forgotPasswordToken": {
      "type": ["string", "null"]
    },
    "userType": {
      "type": "string"
    },
    "createdAt": {
      "type": "string"
    },
    "updatedAt": {
      "type": ["string", "null"]
    },
    "userOrganizations": {
      "type": "array",
      "items": {
        "id": {
          "type": "string"
        },
        "userId": {
          "type": "string"
        },
        "organizationId": {
          "type": "string"
        }
      }
    }
  },
  "userDepartment": {
    "id": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    },
    "departmentId": {
      "type": "string"
    }
  }
}
```

### 4. Forgot Password Request

**Endpoint**: `POST /api/v1/auth/forgot-password`

This endpoint is used to initiate the process of resetting a user's password.

**Request Body Parameters:**

- `email` (string, required): The email address of the user for whom the password reset is requested.

**Response:**

```json
{
  "message": "string",
  "success": true
}
```

### 5. Change User Password

**Endpoint**: `PUT /api/v1/auth/change-password/:id`

This endpoint allows the user to change their password.

**Request Headers:**

- `Content-Type: application/json`

**Request Body Parameters:**

- `oldPassword` (string, required): The user's current password.
- `newPassword` (string, required): The new password.

**Response:**

```json
{
  "type": "object",
  "properties": {
    "message": {
      "type": "string"
    }
  }
}
```

### 6. Reset User Password

**Endpoint**: `PUT /api/v1/auth/reset-password/:id`

This endpoint is used to reset the password for a specific user.

**Request Body Parameters:**

- `newPassword` (string, required): The new password for the user.

**Response:**

```json
{}
```

### 7. Delete User

**Endpoint**: `DELETE /api/v1/auth/delete-user/:id`

This endpoint sends an HTTP DELETE request to delete a specific user identified by their unique ID.

**Request:**

- Method: DELETE
- Endpoint: `/api/v1/auth/delete-user/:id`
- No request body parameters are required for this endpoint.

**Response:**

```json
{
  "message": {
    "type": "string"
  }
}
```

## B. ORGANIZATION

### 1. Create Organization

**Endpoint**: `POST /api/v1/organizations/create-organization`

This endpoint allows you to create a new organization.

**Request Body Parameters:**

- `name` (string, required): The name of the organization.
- `description` (string, required): Description of the organization.

  - `address` (object, required): Address details of the organization.
  - `addressLine1` (string, required): First line of the address.
  - `addressLine2` (string, required): Second line of the address.
  - `city` (string, required): City of the organization.
  - `region` (string, required): Region of the organization.
  - `postalCode` (string, required): Postal code of the organization.
  - `country` (string, required): Country of the organization.

- `phoneNumber` (string, required): Phone number of the organization.
- `organizationEmail` (string, required): Email of the organization.

**Response (Status: 201 - Created):**

```json
{
  "message": "string",
  "success": true,
  "token": "string",
  "organization": {
    "address": { "type": "object" },
    "id": "string",
    "name": "string",
    "description": "string",
    "phoneNumber": "string",
    "organizationEmail": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 2. Update Organization

**Endpoint**: `PUT /api/v1/organizations/update-organization/:id`

This endpoint allows updating an organization with the specified ID.

**Request:**

- Method: PUT
- URL: `{{baseURL}}/api/v1/organizations/update-organization/:id`
- Headers:
  - Content-Type: application/json

**Request Body Parameters:**

```json
{
  "message": "string",
  "success": true,
  "token": "string",
  "organization": {
    "address": { "type": "object" },
    "id": "string",
    "name": "string",
    "description": "string",
    "phoneNumber": "string",
    "organizationEmail": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 3. Select Organization

**Endpoint**: `POST /api/v1/organizations/select-organization`

This endpoint allows the user to select an organization by providing the organization name.

**Request Body Parameters:**

- `organizationName` (string, required): The name of the organization to be selected.

**Response:**

```json
{
  "status": "string",
  "message": "string",
  "data": {
    "organizationId": "string",
    "organizationName": "string"
  }
}
```

### 4. Retrieve Organization Details

**Endpoint**: `GET /api/v1/organizations/organization`

This endpoint retrieves the details of a specific organization.

**Request:**

- Method: GET
- Endpoint: `/api/v1/organizations/organization`

**Response:**

```json
{
  "organizationId": "string",
  "name": "string",
  "address": "string",
  "contact": {
    "email": "string",
    "phone": "string"
  }
}
```

## C. DEPARTMENTS

### 1. Get Departments by Organization

**Endpoint**: `GET /api/v1/departments/get-departments-by-organization`

This endpoint retrieves the list of departments associated with a specific organization.

**Request:**

- Method: GET
- URL: `/api/v1/departments/get-departments-by-organization`
- Headers:
  - Content-Type: application/json

**Request Body Parameters (Optional):**

- `name` (string, required): The name of the department.
- `description` (string, optional): The description of the department.

**Response:**

```json
[
  {
    "departmentId": "string",
    "name": "string"
  },
  {
    "departmentId": "string",
    "name": "string"
  }
]
```

### 2. Get Department Details

**Endpoint**: `GET /api/v1/departments/get-department/:id`

This endpoint retrieves the details of a specific department.

**Request:**

- Method: GET
- URL: `{{baseURL}}/api/v1/departments/get-department/:id`

**Response:**

```json
{
  "departmentId": "string",
  "name": "string",
  "description": "string"
}
```
