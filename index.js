require('dotenv/config');
const express = require('express');
const mongoose = require('mongoose');
const postsRoutes = require('./src/routes/posts')

const app = express();
const DB_CONNECTION = process.env.DB_CONNECTION;
const connectionConfig = { useNewUrlParser: true, useUnifiedTopology: true }

mongoose.connect(DB_CONNECTION, connectionConfig, () => console.log('Connected'));

app.get('/', (req, res) => {
    res.send('We are on home')
})
app.use('/posts', postsRoutes);

app.listen(3000);