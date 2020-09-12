var itemMasterList; // will contain all possible items
var itemViewList; // will contain all items that we are displaying to the user at the time
initialize();


function initialize() {
    //fetch itemMasterList
    itemMasterList = [];
    itemViewList = [];
    readCSV();
    //updateItemViewList();
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
    //updateItemViewList();
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
        newTable.appendChild(createTableRowHTML(item));
    });
    return newTable;
}

// return the HTML of a row on the display table of items that belongs to this particular Item
function createTableRowHTML(item) {
    var row = document.createElement("tr");
    var list = [item.name, item.category, item.price];

    for (var i = 0; i < list.length; i++) {
        var data = document.createElement("td");
        data.innerHTML = list[i];
        row.appendChild(data);
    }

    var td = document.createElement("td");
    var button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("onclick", "location.href='/sign-up/" + item.id + "'");
    button.innerHTML = "Sign-Up";
    td.appendChild(button);
    row.appendChild(td);

    return row;
}

//update the masterlist according to CSV
function readCSV() {
    let xhr = new XMLHttpRequest();
    //console.log(url);
    xhr.open("GET", window.location.href+"itemList");
    xhr.onload = function () {
        //console.log("This is the response text.");
        //console.log(xhr.responseText);
        console.log(xhr.responseText);
        itemMasterList = JSON.parse(xhr.responseText).availableItems;
        updateItemViewList();
    };
    xhr.send();
}

function checkEmailValid() {
    var email = document.getElementsByClassName("sign-up-input-email").value.toLowerCase;
}

function checkNameValid() {

}

// updates itemViewList to be an array containing all Items we're displaying to the user
function updateItemViewList() {
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