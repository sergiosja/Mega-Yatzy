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

const { pool } = require('./database');
const initializeSession = require('./signup');
initializeSession(passport);

app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


/* Run server */
app.listen(PORT);


/* Get requests */
app.get('/', keepIn, (req, res) => {
    res.render('index');
});

app.get('/signup', keepIn, (req, res) => {
    res.render('signup');
});

app.get('/user/main', keepOut, (req, res) => {
    res.render('main');
});

app.get('/user/menu', keepOut, (req, res) => {
    res.render('menu');
});

app.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success', "You have logged out");
    res.redirect('/');
});


/* Login function */
app.post('/signup', async (req, res) => {
    let { username, password, password2 } = req.body;
    let errors = [];

    if (!(username || password || password2)) {
        errors.push({message: 'Please enter all fields'});
    }

    if (username.length > 10) {
        errors.push({message: 'Username cannot exceed 10 characters'});
    }

    if (password.length < 6) {
        errors.push({message: 'Passwords must be minimum 6 characters long'});
    }

    if (password != password2) {
        errors.push({message: 'Passwords must match'});
    }

    if (!(new RegExp('[0-9]')).test(password)) {
        errors.push({message: 'Password must contain a number'});
    }

    if (errors.length > 0) {
        res.render('signup', {errors});
    
    /* If form validation passes */
    } else {
        const encryptedpassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        pool.query(
            `select *
            from users
            where username = $1`,
            [username],
            (error, results) => {
                if (error) {
                    throw error;
                }

                if (results.rows.length > 0) {
                    errors.push({message: 'Username already taken'});
                    res.render('signup', {errors});
                } else {
                    pool.query(
                        `insert into users(username, password)
                        values($1, $2)
                        returning userid, password`,
                        [username, encryptedpassword],
                        (error) => {
                            if (error) {
                                throw error;
                            }

                            req.flash('success', 'You are now registered! Log in to continue.');
                            res.redirect('/');
                        }
                    );
                }
            }
        );
    }
});


/* Adding scores to database */
app.post('/user/main', async (req, res) => {
    const userid = {user: req.user.userid}.user;
    const {score, time} = req.body;
    
    pool.query(
        `insert into scores
        values ($1, $2, $3, current_date)`,
        [userid, score, time],
        (error) => {
            if (error) {
                throw error;
            }
            res.redirect('/user/menu');
        }
    )
});


/* When user tries to log in */
app.post('/', passport.authenticate('local', {
    successRedirect: '/user/menu',
    failureRedirect: '/',
    failureFlash: true
    })
);


/* Prevents logged in users from accesing signup/login screen */
function keepIn(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/user/menu');
    } else {
        next();
    }
}

/* Only logged in users can access features */
function keepOut(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        return res.redirect('/');
    }
}