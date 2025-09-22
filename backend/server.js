// Load environment variables from .env file
require('dotenv').config();

// Import required libraries
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');

// Get Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize the Twilio client and Express app
const client = new twilio(accountSid, authToken);
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(cors()); // Allows requests from your frontend

// The main endpoint for SOS alerts
app.post('/api/alert', (req, res) => {
    const { contacts, message } = req.body;

    // Check if contacts and message are provided
    if (!contacts || !message) {
        return res.status(400).json({ error: 'Missing contacts or message in request body.' });
    }

    console.log(`Alert received. Message: ${message}`);

    // Loop through each contact and send an SMS
    contacts.forEach(contact => {
        if (contact) {
            client.messages.create({
                body: message,
                to: contact,
                from: twilioPhoneNumber
            })
            .then(message => {
                console.log(`Alert sent to ${contact}. SID: ${message.sid}`);
            })
            .catch(err => {
                console.error(`Failed to send message to ${contact}:`, err);
            });
        }
    });

    res.status(200).json({ status: 'Alerts are being sent!' });
});

// Simple welcome route to confirm the server is running
app.get('/', (req, res) => {
    res.send('Shake2Save Backend is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
