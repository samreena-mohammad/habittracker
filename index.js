const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const { WebSocketServer } = require('ws');
const habitRoutes = require('./routes/habitRoutes'); // Import routes

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/', habitRoutes);

// Start the server
app.listen(3000, () => {
    console.log(`Server running at http://localhost:3000`);
});

// WebSocket server
const wss = new WebSocketServer({ port: 8080 });
console.log('WebSocket server running at ws://localhost:8080');

// Broadcast function
function broadcast(message) {
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    });
}

// Daily reminders
cron.schedule('0 9 * * *', () => { // At 9 AM every day
    const incompleteHabits = require('./utils/notifications').getIncompleteHabits();
    if (incompleteHabits.length > 0) {
        const message = `Reminder: You have ${incompleteHabits.length} incomplete habits today.`;
        broadcast(message);
        console.log(message);
    }
});