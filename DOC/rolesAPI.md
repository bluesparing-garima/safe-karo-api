Roles API Documentation
This documentation provides an overview of the Roles API, including endpoints, request formats, and example responses. The Roles API allows for the management of user roles, including creating roles, updating roles, retrieving users by roles, and deleting users.

Base URL
All endpoints will be prefixed with the base URL:

bash
Copy code
http://localhost:8000/api/roles
Endpoints
Create a Role

URL: /createRoles
Method: POST
Description: Creates a new role with user details.
Request Body:
json
Copy code
{
    "name": "popo",
     "description": "his roles is check the leads of jaipur", 
     "created_By": "care taker"  ,
      "phoneNumber": "1234567", 
      "assigned_role": "hr", 
      "email": "popo.com" 
}
Response:
json
Copy code
{
    "status": "success",
    "data": {
        "uuid": "0a27126e-e5b7-460a-8da4-3e6ef2e6be62",
        "name": "popo",
        "description": "his roles is check the leads of jaipur",
        "created_By": "care taker",
        "created_At": "2024-05-30T11:32:54.461Z",
        "phoneNumber": "1234567",
        "assigned_role": "hr",
        "email": "popo.com",
        "_id": "6658648fe14d342c1545f6a7",
        "__v": 0
    },
    "message": "user created succesfully"
}
Get All Users

URL: /getalluser
Method: GET
Description: Retrieves all users from the roles collection.
Response:
json
Copy code
{
    "status": "success",
    "data": [
        {
            "_id": "665847510373ae2bf4408d55",
            "uuid": "36989b74-a333-4a9d-b084-586228885852",
            "name": "hello hello",
            "description": "his roles is check the leads",
            "created_By": "hr",
            "created_At": "2024-05-30T09:26:44.786Z",
            "phoneNumber": "1234567890",
            "assigned_role": "rm",
            "email": "yopmail.com",
            "__v": 0
        },
        {
            "_id": "66585a14d65415dd5d6dfd0f",
            "uuid": "a2413aa0-8cc4-4ea4-a8df-326fb5826825",
            "name": "hello",
            "description": "his roles is check the leads of jaipur",
            "created_By": "hr",
            "created_At": "2024-05-30T10:49:52.900Z",
            "phoneNumber": "123456",
            "assigned_role": "rm",
            "email": "ramu.com",
            "__v": 0
        },
        {
            "_id": "66585a39d65415dd5d6dfd11",
            "uuid": "f235258b-a0fc-41fb-a0f2-239035e65e93",
            "name": "ramu",
            "description": "his roles is check the leads of jaipur",
            "created_By": "care taker",
            "created_At": "2024-05-30T10:49:52.900Z",
            "phoneNumber": "1234567",
            "assigned_role": "hr",
            "email": "shamu.com",
            "__v": 0
        }
    ],
    "message": "success here is your all user in roles collection"
}
Get Users by Role

URL: /getalluserbyroles
Method: GET
Description: Retrieves all users with the specified role.
URL Parameter:
role: The assigned role to filter users by.
Json in body:
{
    "role": "hr" 
}
Response:
json
Copy code
{
    "status": "success",
    "data": [
        {
            "_id": "66585a39d65415dd5d6dfd11",
            "uuid": "f235258b-a0fc-41fb-a0f2-239035e65e93",
            "name": "ramu",
            "description": "his roles is check the leads of jaipur",
            "created_By": "care taker",
            "created_At": "2024-05-30T10:49:52.900Z",
            "phoneNumber": "1234567",
            "assigned_role": "hr",
            "email": "shamu.com",
            "__v": 0
        }
    ],
    "message": "here are your user with same roles"
}
Delete User by Email

URL: /delete/user/:email
Method: DELETE
Description: Deletes a user with the specified email.
URL Parameter:
email: The email of the user to be deleted.
Response:
json
Copy code
{
  "status": "success",
  "message": "User with email john.doe@example.com deleted successfully"
}
Update User by Email

URL: /update/user/:email
Method: POST
Description: Updates the details of a user with the specified email.
URL Parameter:
email: The email of the user to be updated.
Request Body:
json
Copy code
{
  "phoneNumber": "0987654321",
  "assigned_role": "Admin"
}
Response:
json
Copy code
{
  "status": "success",
  "data": {
    "uuid": "generated-uuid",
    "name": "John Doe",
    "description": "A sample user role",
    "created_By": "Admin",
    "phoneNumber": "0987654321",
    "assigned_role": "Admin",
    "email": "john.doe@example.com",
    "createdAt": "2023-06-30T12:00:00.000Z",
    "lastLogin": null
  },
  "message": "User with email john.doe@example.com updated successfully"
}
Example Requests with Postman
Create a Role

Method: POST
URL: http://localhost:8000/api/roles
Body: raw JSON
json
Copy code
{
  "name": "John Doe",
  "description": "A sample user role",
  "created_By": "Admin",
  "phoneNumber": "1234567890",
  "assigned_role": "User",
  "email": "john.doe@example.com"
}
Get All Users

Method: GET
URL: http://localhost:8000/api/roles
Get Users by Role

Method: GET
URL: http://localhost:8000/api/roles/users/User
Delete User by Email

Method: DELETE
URL: http://localhost:8000/api/roles/user/john.doe@example.com
Update User by Email

Method: POST
URL: http://localhost:8000/api/roles/user/update/john.doe@example.com
Body: raw JSON
json
Copy code
{
  "phoneNumber": "0987654321",
  "assigned_role": "Admin"
}
This comprehensive documentation should provide a clear guide for using the Roles API, including creating, retrieving, updating, and deleting user roles.