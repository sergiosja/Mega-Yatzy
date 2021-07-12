/* Dependencies and middleware */
const express = require('express');
const session = require('express-session');
const { request } = require('express');
const flash = require('express-flash');
const passport = require('passport');
const bcrypt = require('bcrypt');
const path = require('path');
const PORT = 3130;

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname + '/views'));

/* Run server */
app.listen(PORT, () => {
    console.log('Server is running');
});


/* Get requests */
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/user/main', (req, res) => {
    res.render('main');
});