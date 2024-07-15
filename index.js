const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
const gql = require('graphql-tag');
const { print } = require('graphql');
const cron = require("node-cron");
const Process = require('./model');
const connectToDB = require('./mongo');
const process = require('./model');

const app = express();
app.use(cors());
app.use(express.json());
connectToDB();

const fetchAndStoreMessages = async (entity) => {
    try {
        const response = await axios.get(`https://sam_backend.haardsolanki-itm.workers.dev/api/process/getmessageId/${entity}`);
        const { ids } = response.data;

        const process = await Process.findOneAndUpdate(
            { processId: entity },
            {
                processId: entity,
                $addToSet: { messageId: { $each: ids } }
            },
            { upsert: true }
        );

        console.log(`Data stored for entity: ${entity}`);
    } catch (error) {
        console.error('Error fetching or storing data:', error);
    }
};

app.post('/schedule', async (req, res) => {
    const { entity, interval } = req.body; // expecting entity and interval in request body

    try {
        // Fetch and store messages immediately upon setup
        await fetchAndStoreMessages(entity);

        // Set up CRON job to run at specified interval
        cron.schedule(interval, () => {
            fetchAndStoreMessages(entity);
        });

        res.status(200).send(`CRON job setup to fetch messages for entity: ${entity} at interval: ${interval}`);
    } catch (error) {
        console.error('Error setting up CRON job:', error);
        res.status(500).send('Error setting up CRON job');
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

module.exports = app;
