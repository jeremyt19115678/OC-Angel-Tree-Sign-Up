const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const app = express();

// initialize Passport by passing in passport instance
const initializePassport = require('./passport-config.js');
initializePassport(passport);

app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//Send CSS to user
app.use('/',express.static(path.join(__dirname, '../Frontend/src/css')));


app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname,'../Frontend/src/Home/index.html'));
});

app.set('view engine', 'ejs');

//send back the data in csv format needed for table
app.get('/testdata.csv',(req, res)=>{
  res.sendFile(path.join(__dirname,'testdata.csv'));
});

//Serve admin login page
app.use('/admin', (req, res) => {
  if (req.isAuthenticated()){
    console.log('authenticated');
    //res.render(path.join(__dirname, '../Frontend/src/views/admin.ejs'),{});
    res.sendFile(path.join(__dirname, '../Frontend/src/AdminLogin/index.html'));
  }else{
    console.log('unaunthenticated');
    res.sendFile(path.join(__dirname, '../Frontend/src/AdminLogin/index.html'));
  }
});

//Handle admin login POST request
//redirect to AdminLogin if login fails
//redirect to 
app.post('/AdminLogin',passport.authenticate('local', {
  successRedirect: '/admin', 
  failureRedirect: '/admin'
}));

/*
app.get('/styles.css', function(req, res) {
  res.sendFile(path.join(__dirname, '../Frontend/src/AdminLogin/styles.css'));
});*/

const PORT = process.env.PORT || 3000;
app.listen(PORT,() => console.log(`Server started on port ${PORT}`));