const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const adminCredentials = require('./credentials.json');
const adminPassword = adminCredentials.password;
const adminUsername = adminCredentials.username;

app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

//Serve static folder for normal user
app.use('/',express.static(path.join(__dirname, 'Frontend')));

//send back the data in csv format needed for table
app.get('/testdata.csv',(req, res)=>{
  res.sendFile(path.join(__dirname,'testdata.csv'));
});

//Serve admin login page
app.use('/AdminLogin', express.static(path.join(__dirname, 'AdminLogin')));

//Serve admin retry login page
app.use('/AdminRetry', express.static(path.join(__dirname, 'AdminRetry')));

//Serve access denied page
app.use('/AccessDenied', express.static(path.join(__dirname, 'AccessDenied')));

//Handle admin login POST request
//redirect to AdminLogin if login fails
//redirect to 
app.post('/AdminLogin',(req, res)=>{
  var username = req.body.username;
  var password = req.body.password;
  if (username == adminUsername && password == adminPassword){
    req.session.loggedin = true;
    res.redirect('/AdminVerified');
  }else{
    res.redirect('/AdminRetry');
  }
});

//Serve AdminVerified Page
app.get('/AdminVerified', function(request, response) {
	if (request.session.loggedin) {
    //response.send('logged in');
    response.sendFile(path.join(__dirname, 'AdminVerified','index.html'));
	} else {
		response.redirect('/AccessDenied');
	}
	response.end();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT,() => console.log(`Server started on port ${PORT}`));