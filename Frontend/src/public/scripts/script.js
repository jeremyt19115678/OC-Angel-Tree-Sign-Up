var itemMasterList; // will contain all possible items
var itemViewList; // will contain all items that we are displaying to the user at the time
var url = window.location.href+"testdata.csv";
initialize();


function initialize() {
    //fetch itemMasterList
    itemMasterList = [];
    itemViewList = [];
    console.log(window.location.href);
    readCSV();
    updateViewTable();
}

//put the item count text and the table itself (@param) on the page
function appendTableHTMLToDOM(table) {
    var tableSection = document.getElementsByClassName("table")[0];
    //add table to page
    tableSection.innerHTML = "";
    tableSection.appendChild(table);

    //add to item-count
    var itemCount = document.getElementsByTagName("tr").length - 1;
    var countDisplay = document.createElement("p"); //creates a p HTML tag
    countDisplay.innerHTML = "Displaying " + itemCount + " items from a list of " + itemMasterList.length + ".";
    document.getElementsByClassName("item-count")[0].innerHTML = "";
    document.getElementsByClassName("item-count")[0].appendChild(countDisplay);
}

//read the select tag and set up sort hierarchy
function sortViewList() {
    var primarySort = document.getElementsByTagName("select")[0].value;
    var hierarchy = [];
    if (primarySort === "name") { //hierarchy: name > category > price
        hierarchy = ["name", "category", "price"];
    } else if (primarySort === "price") { //hierarchy: price > name > category
        hierarchy = ["price", "name", "category"];
    } else if (primarySort === "category") { //hierarchy: category > name > price
        hierarchy = ["category", "name", "price"];
    }
    itemViewList = mergeSort(itemViewList, hierarchy);
}

// Merge Sort Implentation (Recursion)
function mergeSort(unsortedArray, hierarchy) {
    // No need to sort the array if the array only has one element or empty
    if (unsortedArray.length <= 1) {
        return unsortedArray;
    }
    // In order to divide the array in half, we need to figure out the middle
    const middle = Math.floor(unsortedArray.length / 2);

    // This is where we will be dividing the array into left and right
    const left = unsortedArray.slice(0, middle);
    const right = unsortedArray.slice(middle);

    // Using recursion to combine the left and right
    return merge(
        mergeSort(left, hierarchy), mergeSort(right, hierarchy), hierarchy
    );
}

// Merge the two arrays: left and right
function merge(left, right, hierarchy) {
    let resultArray = [], leftIndex = 0, rightIndex = 0;

    // We will concatenate values into the resultArray in order
    while (leftIndex < left.length && rightIndex < right.length) {
        for (var i = 0; i < hierarchy.length; i++) {
            if (left[leftIndex][hierarchy[i]] < right[rightIndex][hierarchy[i]]) {
                resultArray.push(left[leftIndex]);
                leftIndex++; // move left array cursor
                break;
            } else if (left[leftIndex][hierarchy[i]] === right[rightIndex][hierarchy[i]]) {
                if (i == hierarchy.length - 1) {
                    resultArray.push(right[rightIndex]);
                    rightIndex++;
                }
                continue;
            } else {
                resultArray.push(right[rightIndex]);
                rightIndex++; // move right array cursor
                break;
            }
        } // move right array cursor
    }

    // We need to concat here because there will be one element remaining
    // from either left OR the right
    return resultArray
        .concat(left.slice(leftIndex))
        .concat(right.slice(rightIndex));
}

//read the spreadsheet for available items
//update masterlist
//update HTML according to masterlist
function refresh() {
    readCSV();
    updateViewTable();
}

//create the HTML of the header of display table
function createTableHeader() {
    var headerRow = document.createElement("tr");
    var headerInfo = [["64%", "Item Name"], ["12%", "Category"], ["12%", "Price Range"], ["12%", "Sign-Up"]];
    for (var i = 0; i < headerInfo.length; i++) {
        data = document.createElement("th");
        data.setAttribute("width", headerInfo[i][0]);
        data.innerHTML = headerInfo[i][1];
        headerRow.appendChild(data);
    }
    return headerRow;
}

// create the HTML Table from list of Items objects we're displaying (itemViewList)
function createTableFromList() {
    sortViewList();

    var newTable = document.createElement("table");
    newTable.setAttribute("class", "display-items");

    //create header
    var headerRow = createTableHeader();
    newTable.appendChild(headerRow);

    //create HTML of each Item, which takes one row
    itemViewList.forEach(function (item, index) {
        newTable.appendChild(item.createTableRowHTML());
    });
    return newTable;
}

//update the masterlist according to CSV
function readCSV() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = function () {
        var table = xhr.responseText.split("\n");
        itemMasterList = [];
        for (var i = 0; i < table.length; i++) {
            table[i] = table[i].split(",");
            itemMasterList.push(new Item(table[i]));
        }
        updateViewTable();
    };
    xhr.send();
}

function checkEmailValid() {
    var email = document.getElementsByClassName("sign-up-input-email").value.toLowerCase;
}

function checkNameValid() {

}

// updates itemViewList to be an array containing all Items we're displaying to the user
function updateViewTable() {
    itemViewList = [];
    //filter first
    var filters = [];
    var elements = document.getElementsByClassName("checkbox");
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].checked) {
            filters.push(elements[i].id);
        }
    }
    itemMasterList.forEach(function (item, index) {
        if (filters.includes(item.category)) {
            itemViewList.push(item);
        }
    });

    //get rid of items that don't have search bar value from itemViewList
    var searchPhrase = document.getElementsByClassName("search-bar")[0].value.toLowerCase();
    if (searchPhrase != undefined) {
        for (var i = itemViewList.length - 1; i >= 0; i--) {
            if (!itemViewList[i].name.toLowerCase().includes(searchPhrase)) {
                itemViewList.splice(i, 1); // deletes the item at index i
            }
        }
    }

    var table = createTableFromList();
    appendTableHTMLToDOM(table);
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
        this.signUpState = "AVAILABLE";
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

    // return attributes relevant to Item's display
    getAttributes() {
        return [this.name, this.category, this.price];
    }

    // return the HTML of a row on the display table of items that belongs to this particular Item
    createTableRowHTML() {
        var row = document.createElement("tr");
        var list = this.getAttributes();

        for (var i = 0; i < list.length; i++) {
            var data = document.createElement("td");
            data.innerHTML = list[i];
            row.appendChild(data);
        }

        var td = document.createElement("td");
        var button = document.createElement("button");
        button.setAttribute("type", "button");
        button.setAttribute("onclick", "location.href='/sign-up/" + this.id + "'");
        button.innerHTML = "Sign-Up";
        td.appendChild(button);
        row.appendChild(td);

        return row;
    }
}