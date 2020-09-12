const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const flash = require('express-flash');
const itemLists = require('./all-things-items.js');
const app = express();

// initialize Passport by passing in passport instance
const initializePassport = require('./passport-config.js');
const { isNullOrUndefined } = require('util');
initializePassport(passport);

app.use(flash());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//Send CSS to user
app.use('/',express.static(path.join(__dirname, '../Frontend/src/public')));


app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname,'../Frontend/src/Home/index.html'));
});

// used for rendering using ejs
app.set('view engine', 'ejs');

//send back the data in csv format needed for table
app.get('/itemList',(req, res)=>{
  let fetchedItemViewList = itemLists.fetchAvailableItems();
  res.json(fetchedItemViewList);
  
  //  res.sendFile(path.join(__dirname,'testdata.csv'));
});

// Serve the sign-up page
app.get('/sign-up/:itemId', (req, res) =>{
  // look up the object
  let fetchedItem = itemLists.fetchItemWithID(req.params.itemId);
  // render accordingly
  console.log(fetchedItem);
  if (fetchedItem != null){
    res.render(path.join(__dirname, '../Frontend/src/views/item-signup.ejs'), {item: {'name': fetchedItem.name}})
  }else{
    res.send("we can't find an item with ID " + req.params.itemId);
  }
});

//Serve admin login page
app.use('/admin', (req, res) => {
  if (req.isAuthenticated()){
    console.log('authenticated');
    res.sendFile(path.join(__dirname, '../Frontend/src/AdminVerified/index.html'));
  }else{
    console.log('unauthenticated');
    res.render(path.join(__dirname, '../Frontend/src/views/admin-login.ejs'));
  }
});

//Handle admin login POST request
app.post('/AdminLogin',passport.authenticate('local', {
  successRedirect: '/admin', 
  failureRedirect: '/admin',
  failureFlash: true
}));

//Handle sign-up POST request
app.post('/sign-up/:itemId', (req, res) =>{
  let user = {
    'name': req.body.name,
    'email': req.body.email,
    'phone': req.body.phone,
    'itemId': req.params.itemId
  };
  res.send(user);
  // write the new user into the json
  // take the item out of available-items.json
  // write the user data into all-items.json
  // res.send([req.body.name, req.body.email, req.body.phone]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,() => console.log(`Server started on port ${PORT}`));