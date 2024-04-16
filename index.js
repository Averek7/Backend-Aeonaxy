const express = require('express');
const db = require('./db/connection');
const bodyParser = require('body-parser');
require('dotenv').config();

const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.use('/user', require('./routes/user'))
app.use('/course', require('./routes/course'))
app.use('/enroll', require('./routes/enroll'))

db.isConnected();

app.get('/', (req, res) => {
    res.send('Welcome to the Super App');
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

module.exports = app;