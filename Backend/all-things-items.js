const fs = require('fs');
const path = require('path');

if (!fs.existsSync(path.join(__dirname,'all-items.json')) || !fs.existsSync(path.join(__dirname,'available-items.json'))){
    console.log("Lack either all-items.json or available-items.json.\nRewriting these files from CSV.");
    fetchItemListsFromCSV();
}

// called when we get a brand-new CSV (we assume all items are not adopted)
// populate allItems and availableItems with Item Objects
// write all-items.json and available-items.json
function fetchItemListsFromCSV() {
    let allItems = [], availableItems = [];
    fs.readFile(path.join(__dirname,'./testdata.csv'), 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        var table = data.split("\n");
        for (var i = 0; i < table.length; i++) {
            table[i] = table[i].split(",");
            let item = new Item(table[i]);
            allItems.push(item);
            availableItems.push(item);
        }
        let allItemsJSON = JSON.stringify({'allItems': allItems}, null, 2);
        let availableItemsJSON = JSON.stringify({'availableItems': availableItems}, null, 2);
        fs.writeFileSync(path.join(__dirname,'all-items.json'), allItemsJSON);
        fs.writeFileSync(path.join(__dirname,'available-items.json'), availableItemsJSON);
      });
}

// reads from the available-items.json
function fetchAvailableItems(){
    let rawdata = fs.readFileSync(path.join(__dirname,'available-items.json'));
    let parsedData = JSON.parse(rawdata);
    return parsedData;
}

// reads from all-items.json
// NOT meant to be exported (unsafe)
function fetchAllItems(){
    let rawdata = fs.readFileSync(path.join(__dirname,'all-items.json'));
    let parsedData = JSON.parse(rawdata);
    return parsedData;
}

// look through all-items.json and return the item with the particular id
function fetchItemWithID(id){
    let rawdata = fs.readFileSync(path.join(__dirname,'all-items.json'));
    let parsedData = JSON.parse(rawdata);
    return parsedData.allItems.find(elements => elements.id === id);
}

// update all-items.json and available-items.json given that the user has adopted a new Item @param
function updateItemLists(adoptedItem){
    //remove the adoptedItem out of available-items.json
    let availableItems = fetchAvailableItems()['availableItems'];
    let indexInAvailableItems = availableItems.findIndex(element => element.id === adoptedItem.id);
    if (indexInAvailableItems !== 1){
        availableItems.splice(indexInAvailableItems, 1);
    }else{
        return 'Something went wrong.';
    }
    let availableItemsJSON = JSON.stringify({'availableItems': availableItems}, null, 2);
    fs.writeFileSync(path.join(__dirname,'available-items.json'), availableItemsJSON);

    //replace the old adoptedItem in all-items.json with the new one
    let allItems = fetchAllItems()['allItems'];
    let indexInAllItems = allItems.findIndex(element => element.id === adoptedItem.id);
    if (indexInAllItems !== 1){
        allItems[indexInAllItems] = adoptedItem;
    }else{
        return 'Something went wrong.';
    }
    let allItemsJSON = JSON.stringify({'allItems': allItems}, null, 2);
    fs.writeFileSync(path.join(__dirname,'all-items.json'), allItemsJSON);
}

class Item {
    //structure based on 2018 table
    constructor(data) {
        this.name = data[6];
        if (data[7].trim().length != 0) {
            this.name += " (" + data[7] + ")";
        }
        this.price = Item.getBudget(data[4]);
        this.id = data[1];
        this.category = Item.getCategory(data[6]);
        this.adopter = null;
    }

    // rudimentary category classification using keyword detection
    static getCategory(str) {
        var categories = ["Clothing/Accessory", "Shoes", "Stationery", "Gift Cards"];
        var keys = [["褲", "外套", "手環", "錶", "shirt", "衣"], ["鞋"], ["筆", "文具"], ["券", "元"]];
        for (var i = 0; i < keys.length; i++) {
            for (var j = 0; j < keys[i].length; j++) {
                if (str.toLowerCase().includes(keys[i][j])) {
                    return categories[i];
                }
            }
        }
        return "Miscellaneous";
    }

    // rudimentary budget classification using keyword detection
    static getBudget(str) {
        if (str.includes("大")) {
            return 1200;
        } else if (str.includes("高")) {
            return 1000;
        } else if (str.includes("中")) {
            return 800;
        } else {
            return 600;
        }
    }
}

module.exports = {'fetchAvailableItems': fetchAvailableItems, 'fetchItemWithID': fetchItemWithID, 'updateItemLists': updateItemLists, 'fetchItemListsFromCSV': fetchItemListsFromCSV};