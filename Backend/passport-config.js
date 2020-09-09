const localStrategy = require('passport-local').Strategy
const adminCredentials = require('./credentials.json');
const adminPassword = adminCredentials.password;
const adminUsername = adminCredentials.username;

function initialize(passport){
    const verifyCallback = (username, password, done) => {
        const user = {
            'username': username, 
            'password': password
        };
        if (user['username'] !== adminUsername || user['password'] !== adminPassword){
            return done(null, false, {message: "Invalid username or password."});
        }else{
            return done(null, user); //indicates user authenticated
        }
    }
 
    passport.use(new localStrategy(verifyCallback));
    passport.serializeUser((user, done) => { //serialize admin session
        done(null, 'admin-session'); 
    });
    passport.deserializeUser((id, done) => { //deserialize admin session
        return done(null, 'admin-session');
    })
}

module.exports = initialize;