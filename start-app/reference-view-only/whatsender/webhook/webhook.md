# 1. event type samples
{
  "event": "messages-group.received",
  "timestamp": 1633456799,
  "data": {
    "messages":
      {
        "key": {
          "id": "message-id-group-456",
          "fromMe": false,
          "remoteJid": "123456789-987654321@g.us",
          "participant": "123456789@lid",
          "participantPn": "123456789@s.whatsapp.net",
          "cleanedParticipantPn": "123456789",
          "participantLid": "123456789@lid", 
          "addressingMode": "lid"
        },
        "messageBody": "Hey everyone, just checking in!",
        "message": {
          "conversation": "Hey everyone, just checking in!"
        }
      }
  }
}

--
{
  "event": "messages.reaction",
  "timestamp": 1633456810,
  "data": [
    {
      "key": {
        "id": "message-id-123",
        "fromMe": false,
        "remoteJid": "+1234567890"
      },
      "reaction": {
        "text": "👍", // The emoji reaction
        "key": {
          "id": "message-id-123",
          "fromMe": false,
          "remoteJid": "+1234567890"
        }
      }
    }
  ]
}
---

{
  "event": "messages.received",
  "timestamp": 1633456789,
  "data": {
    "messages": 
      {
        "key": {
          "id": "3EB0X123456789",
          "fromMe": false,
          "remoteJid": "1234567890@s.whatsapp.net", // could also be 555555555@lid based on the addressingMode
          "addressingMode": "pn", 
          "senderPn": "1234567890@s.whatsapp.net",
          "cleanedSenderPn": "1234567890",
          "senderLid": "555555555@lid"
        },
        "messageBody": "Hello, I have a question",
        "message": {
          "conversation": "Hello, I have a question"
        }
      }
  }
}

---
{
  "event": "messages-personal.received",
  "timestamp": 1633456789,
  "data": {
    "messages":
      {
        "key": {
          "id": "3EB0X123456789",
          "fromMe": false,
          "remoteJid": "1234567890@s.whatsapp.net",
          "addressingMode": "pn", 
          "senderPn": "1234567890@s.whatsapp.net",
          "cleanedSenderPn": "1234567890",
          "senderLid": "555555555@lid"
        },
        "messageBody": "Hello, I have a question",
        "message": {
          "conversation": "Hello, I have a question"
        }
      }
  }
}
--
{
  "event": "messages.reaction",
  "timestamp": 1633456810,
  "data": [
    {
      "key": {
        "id": "message-id-123",
        "fromMe": false,
        "remoteJid": "+1234567890"
      },
      "reaction": {
        "text": "👍", // The emoji reaction
        "key": {
          "id": "message-id-123",
          "fromMe": false,
          "remoteJid": "+1234567890"
        }
      }
    }
  ]
}

## 2. Handling media type
https://wasenderapi.com/api-docs/getting-started/how-to-receive-messages-and-media-from-wasenderapi
When you get a new WhatsApp message, we send a POST request to your server (webhook). Inside is a JSON payload with all the message details.

The Message Payload
The JSON structure has been updated. The data.messages field is now a single object (not an array) containing the normalized key, the unified messageBody, and the raw message content.

{
  "event": "messages.received",
  "timestamp": 1633456789,
  "data": {
    "messages": {
      "key": {
        "id": "3EB0X123456789",
        "fromMe": false,
        "remoteJid": "123456789@lid", 
        "cleanedSenderPn": "5551234567",
        "senderLid": "123456789@lid"
      },
      "messageBody": "Hello! This is a test.",
      "message": {
        "conversation": "Hello! This is a test."
      }
    }
  }
}
Key Fields Explained:
key.cleanedSenderPn: (Recommended) The sender's phone number in private chats. Use this for your database or logic.
key.cleanedParticipantPn: (Recommended) The sender's phone number in group chats.
key.remoteJid: The unique ID of the chat.
⚠️ Important: Do not rely on remoteJid to be a phone number. It can often be a LID (Linked ID, ending in @lid). Always use the "cleaned" fields if you need the specific phone number.
messageBody: The unified text content of the message. Whether it's a text message, an image caption, or a reply, the text will always be here.
Reading the Message Content
1. The Easy Way (Text)
You no longer need to check multiple fields (like conversation vs extendedTextMessage). Just use data.messages.messageBody.

2. Media Messages
For media, look inside the raw data.messages.message object for keys like imageMessage, videoMessage, or audioMessage.

# 3. How to Decrypt Media Files
Important Update: You no longer have to decrypt the media yourself if you don’t want to. We now provide a secure API endpoint that does it for you automatically: Decrypt Media File API.

Decrypt api
```
curl -X POST "https://www.wasenderapi.com/api/decrypt-media" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "messages": {
        "key": {
          "id": "YOUR_UNIQUE_MESSAGE_ID"
        },
        "message": {
          "imageMessage": {
            "url": "URL_OF_ENCRYPTED_IMAGE",
            "mimetype": "image/jpeg",
            "mediaKey": "YOUR_MEDIA_KEY"
          }
        }
      }
    }
  }'

{
  "success": true,
  "publicUrl": "https://www.wasenderapi.com/api/decrypted-media/YOUR_UNIQUE_MESSAGE_ID"
}
  ```

If you choose to decrypt manually, use the code examples below.
```
const crypto = require('crypto');

function getDecryptionKeys(mediaKeyBuffer, mediaType) {
    const infoMap = {
        image: 'WhatsApp Image Keys', sticker: 'WhatsApp Image Keys',
        video: 'WhatsApp Video Keys', audio: 'WhatsApp Audio Keys',
        document: 'WhatsApp Document Keys',
    };
    const info = infoMap[mediaType];
    if (!info) throw new Error(`Invalid media type: ${mediaType}`);
    return new Promise((resolve, reject) => {
        crypto.hkdf('sha256', mediaKeyBuffer, '', Buffer.from(info), 112, (err, key) => {
            if (err) return reject(err);
            resolve(Buffer.from(key));
        });
    });
}

try {
    const item = items[0];
    
    // 1. Access body.data.messages directly (Object)
    const messageData = item.json.body?.data?.messages;
    const message = messageData?.message;

    if (!message) {
        return null; 
    }

    let mediaDetails;
    let mediaType = '';

    if (message.imageMessage) {
        mediaType = 'image';
        mediaDetails = message.imageMessage;
    } else if (message.audioMessage) {
        mediaType = 'audio';
        mediaDetails = message.audioMessage;
    } else if (message.videoMessage) {
        mediaType = 'video';
        mediaDetails = message.videoMessage;
    } else if (message.documentMessage) {
        mediaType = 'document';
        mediaDetails = message.documentMessage;
    }

    if (!mediaDetails) {
        return null;
    }

    const mediaUrl = mediaDetails.url;
    const mediaKey = mediaDetails.mediaKey;
    const response = await this.helpers.httpRequest({ url: mediaUrl, method: 'GET', encoding: 'arraybuffer' });
    const encryptedData = Buffer.from(response);

    const mediaKeyBuffer = Buffer.from(mediaKey, 'base64');
    const keys = await getDecryptionKeys(mediaKeyBuffer, mediaType);
    const iv = keys.slice(0, 16);
    const cipherKey = keys.slice(16, 48);
    const ciphertext = encryptedData.slice(0, -10);

    const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv);
    const decryptedData = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const mimeType = mediaDetails.mimetype;
    const fileName = mediaDetails.fileName || crypto.randomUUID();
    const extension = mimeType.split('/')[1].split(';')[0].trim() || 'bin';
    const finalFileNameWithExt = `${fileName}.${extension}`;

    const binaryData = await this.helpers.prepareBinaryData(decryptedData, finalFileNameWithExt, mimeType);
    item.binary = { data: binaryData };
    item.json.decryptionSuccess = true;
      
    return item;

} catch (error) {
    throw error;
}```