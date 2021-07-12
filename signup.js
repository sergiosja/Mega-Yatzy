/* Dependencies and middleware */
const LocalStrategy = require('passport-local').Strategy;
const { pool } = require('./database');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { authenticate } = require('passport');

function initialize(passport) {
    const authenticateUser = (username, password, done) => {
        pool.query(
            `select *
            from users
            where username = $1`,
            [username],
            (error, results) => {
                if (error) {
                    throw error;
                }

                /* If database contains username */
                if (results.rows.length > 0) {
                    const user = results.rows[0];

                    bcrypt.compare(password, user.password, (error, match) => {
                        if (error) {
                            throw error;
                        }

                        return match ? done(null, user) : done(null, false, {message: 'Incorrect password'});
                    });
                } else {
                    return done(null, false, {message: 'Username not found'});
                }
            }
        )
    }

    passport.use(
        new LocalStrategy ({
            usernameField: 'username',
            passwordField: 'password'
        },
        authenticateUser
        )
    );

    /* Serializes and deserializes session */
    passport.serializeUser((user, done) => done(null, user.userid));

    passport.deserializeUser((userid, done) => {
        pool.query(
            `select *
            from users
            where userid = $1`,
            [userid],
            (error, result) => {
                if (error) {
                    throw error;
                }

                return done(null, result.rows[0]);
            }
        )
    });
}

module.exports = initialize;