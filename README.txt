BACKGROUND:
This is a full-stack web application originally made for Taipei American School's Orphanage Club (OC). OC partners up with the Pearl S. Buck Foundation each Christmas to fulfill about 300 children's Christmas gift. For decades, the Club has facilitated this event using a physical wishlist, on which interested students, parents, or faculty of TAS can sign up by putting down their name, email, and phone numbers beside specific items. This project, although never deployed (perhaps never will--due to risks of leaking important contact information through an amateur application such as this one), was pursued in an attempt to digitize/streamline this process.


DEPENDENCIES:
The project uses Node.js and Express. The packages it uses include express, path, express-session, passport, express-flash, express-fileupload, fs, and passport-local. You can install any of these using

$ npm install package-name


HOW TO RUN:
To run, simply do

$ node /path/to/this/project/Backend/server.js


HOW IT WORKS:
We represent each child's desired Christmas gift with an Item object. Each Item has a unique ID given by the Pearl S. Buck Foundation. If a person signs up for a particular Item, we call that person the "adopter" of the Item.

Backend/all-items.json will keep track of all the information of all items in this year's list. Backend/available-items.json will keep track of all the information of all items that doesn't have an adopter yet. The information about the Items is not stored in a database because of the fact that this project, at the time of its development, does not seem to ever need to be scalable.

On launch, the backend first looks for all-items.json and available-items.json. If it cannot find them, it'd look for Backend/testdata.csv, which is the spreadsheet that Pearl S. Buck sent to OC in 2018 in csv format. The server will parse the file content and create the all-items.json and available-items.json. In the beginning, we assume all items have no adopter yet.

The homepage is a spreadsheet containing all the items that have yet have an adopter. The user can filter items based on their names and categories using the search bar and checkboxes at the top of the page. The user can also sort the Items in specific ways. The refresh button fetches the newest list of items (some items may have been adopted since the last rendering of the homepage).

When the user tries to sign up for an Item, they will be directed to the /sign-up/itemId endpoint. The choice to put the itemId in the URL is to allow users to share URL. If the item with the itemId does not exist or has been adopted, the page will display as such. Otherwise, the user can fill in a form with their Name, Email, and Phone number. If the email and phone number fields are deemed valid, the backend will update available-items.json and all-items.json by taking the just-signed-up item out of available-items and updating its status in all-items.json.

Once an Item has been signed-up, it can no longer be displayed on the homepage or be signed up to again.

With the future in mind of the project's development, the admin feature is implemented. With the correct username and password as dictated by the administrator of the application (stored in Backend/credentials.json), an "admin" can log in to the website, upload a new CSV in the correct format (specific columns correspond to specific information), and the site should be able to take care of a new list.

To prevent a stupid "admin" (or rather, in the case of bad design on my part), upon receiving a new CSV upload, the backend moves the current all-items.json and available-items.json in the folder Backend/old_data/current-timestamp before generating a new one. This way the website administrator can look up if anything wrong had happened.


FUTURE/POTENTIAL FEATURES:
- A look-and-feel of a website that's not made in the 1990s.
- Email notification of the adopter.
- Adopter can un-sign-up an item.
