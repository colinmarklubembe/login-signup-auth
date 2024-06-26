# API Documentation

## Table of Contents

- [A. AUTH](#a-auth)
  - [1. Signup](#1-signup)
  - [2. Auth Login](#2-auth-login)
  - [3. Invite User](#3-invite-user)
  - [4. Forgot Password Request](#4-forgot-password-request)
  - [5. Change User Password](#5-change-user-password)
  - [6. Reset User Password](#6-reset-user-password)
  - [7. Delete User](#7-delete-user)
  - [8. Get Users](#8-get-users)
  - [9. Get User by ID](#9-get-user-by-id)
  - [10. Get Users by Organization](#10-get-users-by-organization)
- [B. ORGANIZATION](#b-organization)
  - [1. Create Organization](#1-create-organization)
  - [2. Update Organization](#2-update-organization)
  - [3. Select Organization](#3-select-organization)
  - [4. Retrieve Organization Details](#4-retrieve-organization-details)
  - [5. Retrieve User Organizations](#5-retrieve-user-organizations)
  - [6. Retrieve All Organizations](#6-retrieve-all-organizations)
  - [7. Delete an organization](#7-delete-an-organization)
- [C. DEPARTMENTS](#c-departments)
  - [1. Get Departments by Organization](#1-get-departments-by-organization)
  - [2. Get Department Details](#2-get-department-details)
  - [3. Create Department](#3-create-department)
  - [4. Update Department](#4-update-department)
  - [5. Delete Department](#5-delete-department)

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

### 8. Get Users

**Endpoint**: `GET /api/v1/auth/get-users/`

This endpoint sends an HTTP GET request to get users.

**Request:**

- Method: GET
- Endpoint: `/api/v1/auth/get-users`
- No request body parameters are required for this endpoint.

**Response:**

```json
{
  "users": [{ "user": "object" }]
}
```

### 9. Get User by ID

**Endpoint**: `GET /api/v1/auth/get-user/:id`

This endpoint sends an HTTP GET request to get a specific user identified by their unique ID.

**Request:**

- Method: GET
- Endpoint: `/api/v1/auth/get-user/:id`
- No request body parameters are required for this endpoint.

**Response:**

```json
{
  "success": boolean,
  "user": {
    "type": "object"
  }
}
```

### 10. Get Users by Organization

**Endpoint**: `GET /api/v1/auth/get-users/`

This endpoint sends an HTTP GET request to get users.

**Request:**

- Method: GET
- Endpoint: `/api/v1/auth/get-users`
- No request body parameters are required for this endpoint.

**Response:**

```json
{
  "organization": "string",
  "users": [{ "user": "object" }]
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
  "user": "object",
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
- URL: `/api/v1/organizations/update-organization/:id`
- Headers:
  - Content-Type: application/json

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

```json
{
  "message": "string",
  "success": true,
  "user": "object",
  "organization": {
    "address": { "type": "object" },
    "id": "string",
    "name": "string",
    "description": "string",
    "phoneNumber": "string",
    "organizationEmail": "string",
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
  "message": "string",
  "success": true,
  "organization": {
    "address": { "type": "object" },
    "id": "string",
    "name": "string",
    "description": "string",
    "phoneNumber": "string",
    "organizationEmail": "string",
    "updatedAt": "string"
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
  "organization": {
    "address": { "type": "object" },
    "id": "string",
    "name": "string",
    "description": "string",
    "phoneNumber": "string",
    "organizationEmail": "string",
    "updatedAt": "string"
  }
}
```

### 5. Retrieve User Organizations

**Endpoint**: `GET /api/v1/organizations/user-organizations`

This endpoint retrieves the organizations of a specific user.

**Request:**

- Method: GET
- Endpoint: `/api/v1/organizations/user-organizations`

**Response:**

```json
{
  "success": true,
  "organizations": [{ "organization": "object" }]
}
```

### 6. Retrieve All Organizations

**Endpoint**: `GET /api/v1/organizations/organizations`

This endpoint retrieves all organizations.

**Request:**

- Method: GET
- Endpoint: `/api/v1/organizations`

**Response:**

```json
{
  "success": true,
  "organizations": [{ "organization": "object" }]
}
```

### 7. Delete an organization

**Endpoint**: `DELETE /api/v1/organizations/delete-organization/:id`

This endpoint retrieves the organizations of a specific user.

**Request:**

- Method: DELETE
- Endpoint: `/api/v1/organizations/delete-organization/:id`

**Response:**

```json
{
  "message": "object",
  "organization": undefined
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

### 3. Create Department

**Endpoint**: `POST /api/v1/departments/create-department`

The Create Department endpoint allows you to add a new department to the CRM system.

**Reques Body:**

- `name` (string, required): The name of the department.
- `description` (string, required): A brief description of the department.

**Response:**
The response is in JSON format and includes the following fields:

```json
{
  "message": "string",
  "newDepartment": {
    "id": "string",
    "name": "string",
    "description": "string",
    "organizationId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 4. Update Department

**Endpoint**: `PUT /api/v1/departments/update-department`

The Update Department endpoint allows you to update a department.

**Reques Body:**

- `name` (string, required): The name of the department.
- `description` (string, required): A brief description of the department.

**Response:**
The response is in JSON format and includes the following fields:

```json
{
  "message": "string",
  "updatedDepartment": {
    "id": "string",
    "name": "string",
    "description": "string",
    "organizationId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 5. Delete Department

**Endpoint**: `DELETE /api/v1/departments/delete-department`

The Delete Department endpoint allows you to delete a department from the CRM system.

**Response:**
The response is in JSON format and includes the following fields:

```json
{
  "message": "string",
  "deletedDepartment": {
    "id": "string",
    "name": "string",
    "description": "string",
    "organizationId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```
