const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const flash = require('express-flash');
const fileUpload = require('express-fileupload');
const itemLists = require('./all-things-items.js');
const fs = require('fs');
const app = express();

// initialize Passport by passing in passport instance
const initializePassport = require('./passport-config.js');
const { fstat } = require('fs');
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

// allow file upload
app.use(fileUpload());

//Send CSS to user
app.use('/',express.static(path.join(__dirname, '../Frontend/src/public')));


app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname,'../Frontend/src/Home/index.html'));
});

// used for rendering using ejs
app.set('view engine', 'ejs');

//send frontend the available items
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
  if (fetchedItem == null){
    res.send("we can't find an item with ID " + req.params.itemId);
  }else if(fetchedItem.adopter != null){
    res.send("This item is no longer available. Please try again.");
  }else{
    res.render(path.join(__dirname, '../Frontend/src/views/item-signup.ejs'), {item: {'name': fetchedItem.name, 'id': fetchedItem.id}, error: {'message': null}})
  }
});

//Serve admin login page
app.use('/admin', (req, res) => {
  if (req.isAuthenticated()){
    res.sendFile(path.join(__dirname, '../Frontend/src/AdminVerified/index.html'));
  }else{
    res.render(path.join(__dirname, '../Frontend/src/views/admin-login.ejs'));
  }
});

//Handle admin login POST request
app.post('/AdminLogin',passport.authenticate('local', {
  successRedirect: '/admin', 
  failureRedirect: '/admin',
  failureFlash: true
}));

// Handle sign-up POST request
app.post('/sign-up/:itemId', (req, res) =>{
  //represent the user as a json
  let user = {
    'name': req.body.name,
    'email': req.body.email,
    'phone': req.body.phone,
  };

  let fetchedItem = itemLists.fetchItemWithID(req.params.itemId);

  if (fetchedItem == null){
    res.send("The item you're signing up for doesn't exist. Please try again.");
  }else if (fetchedItem.adopter != null){
    res.send("The item you're signing up for is no longer available. Please try again.");
  }else if (!isValidEmail(user.email) || !isValidPhone(user.phone)){ //check if user email and phone are valid
    return res.render(path.join(__dirname, '../Frontend/src/views/item-signup.ejs'), {item: {'name': fetchedItem.name, 'id': fetchedItem.id}, error: {'message': "Please make sure you're using a valid TAS email address or Taiwanese phone number."}});
  } else {
    fetchedItem.adopter = user;
    itemLists.updateItemLists(fetchedItem);
    res.send(`Thanks ${user.name}, you have signed up for the following item. You should receive an email shortly.\nYour item: ${fetchedItem.name}`);
  }
});

app.post('/CSVUpload', checkIfAuthenticated, (req, res) =>{
  try {
    if(!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded'
      });
    } else {
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let csv = req.files.csv;

      //move the previous test data into old_data/currentTimestamp
      const timestamp = Date.now();
      fs.mkdirSync(path.join(__dirname, `./old_data/${timestamp}`));
      fs.renameSync(path.join(__dirname, './testdata.csv'), path.join(__dirname, `./old_data/${timestamp}/testdata.csv`));
      fs.renameSync(path.join(__dirname, './all-items.json'), path.join(__dirname, `./old_data/${timestamp}/all-items.json`));
      fs.renameSync(path.join(__dirname, './available-items.json'), path.join(__dirname, `./old_data/${timestamp}/available-items.json`));

      //Use the mv() method to place the file in upload directory (i.e. "uploads")
      csv.mv(path.join(__dirname, './testdata.csv'));
      itemLists.fetchItemListsFromCSV();

      //send response
      res.send("file received");
    }
  } catch (err) {
    //res.send("Error Occured.");
    res.status(500).send(err);
  }
});

//middleware used to restrict access
function checkIfAuthenticated(req, res, next){
  if (req.isAuthenticated){
    return next();
  }
  res.redirect('/admin');
}

// regex matching function for emails
function isValidEmail(email){
  let validEmailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return validEmailRegex.test(email);
}

// regex matching function for phone numbers
function isValidPhone(phone){
  let validPhoneRegex = /^0(([249][0-9]{8})|([3-8][0-9]{7}))$/;
  return validPhoneRegex.test(phone);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT,() => console.log(`Server started on port ${PORT}`));