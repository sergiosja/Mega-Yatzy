/* Dependencies and middleware */
const express = require('express')
const session = require('express-session')
const { request } = require('express')
const flash = require('express-flash')
const passport = require('passport')
const bcrypt = require('bcrypt')
const path = require('path')
const PORT = 3130

const app = express()
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(express.static(__dirname + '/views'))

const { pool } = require('./database')
const initializeSession = require('./signup')
initializeSession(passport)

app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false
    })
)

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())


/* Run server */
app.listen(PORT)

/* Get requests */
app.get('/', keepIn, (req, res) => {
    res.render('index')
})

app.get('/logout', (req, res) => {
    req.logOut()
    req.flash('success', "You have logged out")
    res.redirect('/')
})

app.get('/signup', keepIn, (req, res) => {
    res.render('signup')
})

app.get('/user/main', keepOut, (req, res) => {
    res.render('main')
})

app.get('/user/tutorial', keepOut, (req, res) => {
    res.render('tutorial')
})

app.get('/user/menu', keepOut, (req, res) => {
    res.render('menu')
})

app.get('/user/local', keepOut, (req, res) => {
    const userid = {user: req.user.userid}.user
    pool.query(
        `select *
        from scores
        where userid = $1
        order by score desc, time asc, date asc
        limit 30`,
        [userid],
        (error, results) => {
            if (error) {
                throw error
            }

            let header = []
            let scores = []
            header.push({row: "Score"})
            header.push({row: "Time"})
            header.push({row: "Date"})

            for (let i = 0; i < results.rows.length; i++) {
                const score = results.rows[i].score
                const time = calculateTime(results.rows[i].time)
                const date = (parseInt(JSON.stringify(results.rows[i].date).slice(9,11)) + 1)
                             + "/" + JSON.stringify(results.rows[i].date).slice(6, 8)
                             + "-" + JSON.stringify(results.rows[i].date).slice(3, 5)
                
                scores.push({score, time, date})
            }

            res.render('local', {header, scores})
        }
    )
})

app.get('/user/global', keepOut, (req, res) => {
    pool.query(
        `select distinct username, score, time, date
        from scores s
        inner join users u on (s.userid = u.userid)
        order by score desc, time asc, date
        limit 30`,
        (error, results) => {
            if (error) {
                throw error
            }

            let header = []
            let scores = []
            header.push({row: "User"})
            header.push({row: "Score"})
            header.push({row: "Time"})
            header.push({row: "Date"})
            
            for (let i = 0; i < results.rows.length; i++) {
                const user = results.rows[i].username.slice(0, 10).toLowerCase()
                const score = results.rows[i].score
                const time = calculateTime(results.rows[i].time)
                const date = (parseInt(JSON.stringify(results.rows[i].date).slice(9,11)) + 1)
                             + "/" + JSON.stringify(results.rows[i].date).slice(6, 8)
                             + "-" + JSON.stringify(results.rows[i].date).slice(3, 5)

                scores.push({user, score, time, date})
            }

            res.render('global', {header, scores})
        }
    )
})


/* Helper function to calculate time */
function calculateTime(seconds) {
    return seconds % 60 == 0 ? Math.floor(seconds / 60) + "m" :
           seconds > 60 ? Math.floor(seconds / 60) + "m " + seconds % 60 + "s" :
           seconds + "s"
}


/* Adding scores to database */
app.post('/user/main', async (req, res) => {
    const userid = {user: req.user.userid}.user
    const {score, time} = req.body
    
    pool.query(
        `insert into scores
        values ($1, $2, $3, current_date)`,
        [userid, score, time],
        (error) => {
            if (error) {
                throw error
            }
            res.redirect('/user/menu')
        }
    )
})


/* Login function */
app.post('/signup', async (req, res) => {
    let { username, password, password2 } = req.body
    let errors = []

    if (!(username || password || password2)) {
        errors.push({message: 'Please enter all fields'})
    }

    if (username.length > 10) {
        errors.push({message: 'Username cannot exceed 10 characters'})
    }

    if (password.length < 6) {
        errors.push({message: 'Passwords must be minimum 6 characters long'})
    }

    if (password != password2) {
        errors.push({message: 'Passwords must match'})
    }

    if (!(new RegExp('[0-9]')).test(password)) {
        errors.push({message: 'Password must contain a number'})
    }

    if (errors.length > 0) {
        res.render('signup', {errors})
    
    /* If form validation passes */
    } else {
        const encryptedpassword = await bcrypt.hash(password, await bcrypt.genSalt(10))
        pool.query(
            `select *
            from users
            where username = $1`,
            [username],
            (error, results) => {
                if (error) {
                    throw error
                }

                if (results.rows.length > 0) {
                    errors.push({message: 'Username already taken'})
                    res.render('signup', {errors})
                } else {
                    pool.query(
                        `insert into users(username, password)
                        values($1, $2)
                        returning userid, password`,
                        [username, encryptedpassword],
                        (error) => {
                            if (error) {
                                throw error
                            }

                            req.flash('success', 'You are now registered! Log in to continue.')
                            res.redirect('/')
                        }
                    )
                }
            }
        )
    }
})


/* When user tries to log in */
app.post('/', passport.authenticate('local', {
    successRedirect: '/user/menu',
    failureRedirect: '/',
    failureFlash: true
    })
)


/* Prevents logged in users from accesing signup/login screen */
function keepIn(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/user/menu')
    } else {
        next()
    }
}

/* Only logged in users can access features */
function keepOut(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        return res.redirect('/')
    }
}