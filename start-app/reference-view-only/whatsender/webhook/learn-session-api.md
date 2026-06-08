WasenderAPI - Sessions Endpoints

Manage WhatsApp device connections through sessions. A session represents a single WhatsApp account linked to the system.

Note: All endpoints require an access token to be included in the Authorization: Bearer YOUR_API_KEY header.

Get All WhatsApp Sessions
Retrieves a list of all WhatsApp sessions available to the authenticated user.

cURL:
curl -X GET "https://www.wasenderapi.com/api/whatsapp-sessions"

-H "Authorization: Bearer YOUR_API_KEY"

Success Response (200 OK):
{
"success": true,
"data": [
{
"id": 1,
"name": "Primary Support Number",
"status": "connected",
"created_at": "2023-10-25T10:00:00Z"
}
]
}

Failure Response (401 Unauthorized):
{
"success": false,
"message": "Unauthenticated or invalid API Key."
}

Create WhatsApp Session
Creates a new WhatsApp session with the provided details. Requires an active subscription.

cURL:
curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions"

-H "Authorization: Bearer YOUR_API_KEY"

-H "Content-Type: application/json"

-d '{"name": "My New Session"}'

Success Response (201 Created):
{
"success": true,
"message": "Session created successfully.",
"data": {
"id": 2,
"name": "My New Session",
"status": "disconnected"
}
}

Failure Response (403 Forbidden):
{
"success": false,
"message": "Subscription limit reached. Cannot create more sessions."
}

Get WhatsApp Session Details
Retrieves details for a specific WhatsApp session.

cURL:
curl -X GET "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"

-H "Authorization: Bearer YOUR_API_KEY"

Success Response (200 OK):
{
"success": true,
"data": {
"id": 1,
"name": "Primary Support Number",
"status": "connected",
"webhook_url": "[suspicious link removed]"
}
}

Failure Response (404 Not Found):
{
"success": false,
"message": "Session not found."
}

Update WhatsApp Session
Updates details for a specific WhatsApp session.

cURL:
curl -X PUT "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"

-H "Authorization: Bearer YOUR_API_KEY"

-H "Content-Type: application/json"

-d '{"name": "Updated Session Name"}'

Success Response (200 OK):
{
"success": true,
"message": "Session updated successfully.",
"data": {
"id": 1,
"name": "Updated Session Name"
}
}

Failure Response (422 Unprocessable Entity):
{
"success": false,
"message": "The name field is required."
}

Get WhatsApp Session Status
Returns the current status of the connected WhatsApp session.

cURL:
curl -X GET "https://www.wasenderapi.com/api/status"

-H "Authorization: Bearer YOUR_API_KEY"

Success Response (200 OK):
{
"success": true,
"status": "connected",
"phone": "1234567890"
}

Failure Response (400 Bad Request):
{
"success": false,
"message": "Session is currently disconnected."
}

Delete WhatsApp Session
Deletes a specific WhatsApp session.

cURL:
curl -X DELETE "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"

-H "Authorization: Bearer YOUR_API_KEY"

Success Response (200 OK):
{
"success": true,
"message": "Session deleted successfully."
}

Failure Response (404 Not Found):
{
"success": false,
"message": "Session not found."
}

Connect WhatsApp Session
Initiates the connection process for a WhatsApp session.

cURL:
curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/connect"

-H "Authorization: Bearer YOUR_API_KEY"

-H "Content-Type: application/json"

Success Response (200 OK):
{
"success": true,
"message": "Connection initiated. Please fetch the QR code to scan."
}

Failure Response (400 Bad Request):
{
"success": false,
"message": "Session is already connected."
}

Restart WhatsApp Session
Restarts a specific, currently connected WhatsApp session.

cURL:
curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/restart"

-H "Authorization: Bearer YOUR_API_KEY"

-H "Content-Type: application/json"

Success Response (200 OK):
{
"success": true,
"message": "Session restarted successfully."
}

Failure Response (400 Bad Request):
{
"success": false,
"message": "Cannot restart a disconnected session."
}

Get WhatsApp Session QR Code
Retrieves the QR code needed to connect a WhatsApp session.

cURL:
curl -X GET "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/qrcode"

-H "Authorization: Bearer YOUR_API_KEY"

Success Response (200 OK):
{
"success": true,
"qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}

Failure Response (400 Bad Request):
{
"success": false,
"message": "Device already linked. No QR code available."
}

Get Message Logs
Retrieves a paginated list of message logs for a specific session.

cURL:
curl -X GET "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/message-logs"

-H "Authorization: Bearer YOUR_API_KEY"

Success Response (200 OK):
{
"success": true,
"data": [
{
"id": 101,
"to": "1234567890",
"message": "Hello World",
"status": "sent",
"timestamp": "2023-10-25T10:15:00Z"
}
],
"pagination": {
"current_page": 1,
"total_pages": 5
}
}

Failure Response (404 Not Found):
{
"success": false,
"message": "Session not found."
}

Disconnect WhatsApp Session
Disconnects an active WhatsApp session.

cURL:
curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/disconnect"

-H "Authorization: Bearer YOUR_API_KEY"

-H "Content-Type: application/json"

Success Response (200 OK):
{
"success": true,
"message": "Session disconnected successfully."
}

Failure Response (400 Bad Request):
{
"success": false,
"message": "Session is already disconnected."
}

Get Session Logs
Retrieves a paginated list of session activity logs.

cURL:
curl -X GET "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/session-logs"

-H "Authorization: Bearer YOUR_API_KEY"

Success Response (200 OK):
{
"success": true,
"data": [
{
"event": "connected",
"timestamp": "2023-10-25T10:05:00Z"
}
]
}

Failure Response (404 Not Found):
{
"success": false,
"message": "Session not found."
}

Get Session User Info
Retrieves information about the WhatsApp user associated with the current API key.

cURL:
curl -X GET "https://www.wasenderapi.com/api/user"

-H "Authorization: Bearer YOUR_API_KEY"

Success Response (200 OK):
{
"success": true,
"data": {
"name": "John Doe",
"email": "john@example.com",
"subscription_plan": "Pro"
}
}

Failure Response (401 Unauthorized):
{
"success": false,
"message": "Invalid access token."
}

Check if a number is on WhatsApp
Verifies if a given Phone Number is registered on WhatsApp.

cURL:
curl -X GET "https://www.wasenderapi.com/api/on-whatsapp/{phone_number}"

-H "Authorization: Bearer YOUR_API_KEY"

Success Response (200 OK):
{
"success": true,
"phone_number": "1234567890",
"on_whatsapp": true,
"jid": "1234567890@s.whatsapp.net"
}

Failure Response (400 Bad Request):
{
"success": false,
"message": "Invalid phone number format."
}

Regenerate API Key
Regenerates the API key for a specific WhatsApp session.

cURL:
curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/regenerate-key"

-H "Authorization: Bearer YOUR_API_KEY"

-H "Content-Type: application/json"

Success Response (200 OK):
{
"success": true,
"api_key": "new_whatsapp_api_key_abc456"
}

Failure Response (404 Not Found):
{
"success": false,
"message": "Session not found or invalid permissions."
}

Send Presence Update
Sends a presence update to a specific JID (e.g., 'typing...' or 'recording...').

cURL:
curl -X POST "https://www.wasenderapi.com/api/send-presence-update"

-H "Authorization: Bearer YOUR_API_KEY"

-H "Content-Type: application/json"

-d '{"jid": "1234567890@s.whatsapp.net", "presence": "composing"}'

Success Response (200 OK):
{
"success": true,
"message": "Presence update sent successfully."
}

Failure Response (400 Bad Request):
{
"success": false,
"message": "Invalid presence state. Must be 'composing', 'recording', or 'paused'."
}