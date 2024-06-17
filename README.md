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

**Response:**

````json
{
  "userId": "string",
  "token": "string"
}



### 2. Auth Login

**Endpoint**: `POST /api/v1/auth/login`

This endpoint allows users to log in and obtain an authentication token.

**Request Body Parameters:**
- `email` (string): The email address of the user.
- `password` (string): The password of the user.

**Response:**
```json
{
  "message": "string",
  "success": true,
  "token": "string"
}

### 3. Invite User

**Endpoint**: `POST /api/v1/users/invite-user`

This endpoint allows you to invite a user.

**Request Body Parameters:**
- `name` (string, required): The name of the user to be invited.
- `email` (string, required): The email address of the user to be invited.
- `userType` (string, required): The type of user to be invited.
- `userOrganizationRoles` (array of strings, required): The roles assigned to the user within the organization.
- `departmentName` (string, required): The name of the department to which the user belongs.

**Response (200 - OK):**
```json
{
  "message": "string",
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "password": "string",
    "name": "string",
    "isVerified": true,
    "verificationToken": "string or null",
    "forgotPasswordToken": "string or null",
    "userType": "string",
    "createdAt": "string",
    "updatedAt": "string or null",
    "userOrganizationRoles": [
      {
        "id": "string",
        "userId": "string",
        "organizationId": "string",
        "roleId": "string",
        "role": {
          "id": "string",
          "name": "string",
          "createdAt": "string or null",
          "updatedAt": "string or null"
        }
      }
    ]
  },
  "userDepartment": {
    "id": "string",
    "userId": "string",
    "departmentId": "string"
  }
}


### 4. Forgot Password Request

**Endpoint**: `POST /api/v1/users/forgot-password`

This endpoint is used to initiate the process of resetting a user's password.

**Request Body Parameters:**
- `email` (string, required): The email address of the user for whom the password reset is requested.

**Response:**
```json
{
  "message": "string",
  "success": true
}


### 5. Change User Password

**Endpoint**: `PUT /api/v1/users/change-password/:id`

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

### 6. Update User Password

**Endpoint**: `PUT /api/v1/users/reset-password/:id`

This endpoint is used to reset the password for a specific user.

**Request Body Parameters:**
- `newPassword` (string, required): The new password for the user.

**Response:**
```json
{
  // Schema representing the structure of the response data
}

### 7. Delete User

**Endpoint**: `DELETE /api/v1/users/delete-user/:id`

This endpoint sends an HTTP DELETE request to delete a specific user identified by their unique ID.

**Request:**
- Method: DELETE
- Endpoint: `{{localURL}}/api/v1/users/delete-user/:id`
- No request body parameters are required for this endpoint.

**Response:**
```json
{
  // Schema describing the structure of the response body
}



## B. ORGANIZATION

### 1. Create Organization

**Endpoint**: `POST /api/v1/organizations/create-organization`

This endpoint allows you to create a new organization.

**Request Body Parameters:**
- `name` (string, required): The name of the organization.

**Response (Status: 201 - Created):**
```json
{
  "message": "string",
  "success": true,
  "token": "string",
  "organization": {
    "id": "string",
    "name": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}


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
  "name": "string"
}


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


### 4. Retrieve Organization Details

**Endpoint**: `GET /api/v1/organizations/organization`

This endpoint retrieves the details of a specific organization.

**Request:**
- Method: GET
- Endpoint: `{{baseURL}}/api/v1/organizations/organization`

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


## C. DEPARTMENTS

### 1. Get Departments by Organization

**Endpoint**: `GET /api/v1/departments/get-departments-by-organization`

This endpoint retrieves the list of departments associated with a specific organization.

**Request:**
- Method: GET
- URL: `{{baseURL}}/api/v1/departments/get-departments-by-organization`
- Headers:
  - Content-Type: application/json

**Request Body Parameters (Optional):**
- `name` (string, optional): The name of the department.

**Response:**
```json
[
  {
    "departmentId": "string",
    "name": "string",
    // Include any other relevant information here
  },
  {
    "departmentId": "string",
    "name": "string",
    // Include any other relevant information here
  }
]


2. Get Department Details
This endpoint retrieves the details of a specific department.
Request
Method: GET
URL: {{baseURL}}/api/v1/departments/get-department/:id

Response
The response for this request will be a JSON object representing the details of the department. Below is a JSON schema representing the structure of the response:

{
  "type": "object",
  "properties": {
    "departmentId": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "manager": {
      "type": "string"
    },
    "location": {
      "type": "string"
    },
    "employees": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  }
}

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
  "manager": "string",
  "location": "string",
  "employees": [
    "string"
  ]
}
````
