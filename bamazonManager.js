var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: require("./password.js"),
    database: "products_db"
});
connection.connect(function (err) {
    if (err) throw err;
    /*test to see connected to server
    console.log("connected as id " + connection.threadId);*/
    menu();
});

function menu() {
    inquirer.prompt([{
        type: "list",
        name: "choice",
        choices: ["View Product Sales", "View Low Inventory", "Add Inventory", "Add New Product"],
        message: "Hello what would you like to do today?"
    }]).then(function (answer) {
        if (answer.choice === "View Product Sales") {
            //show current inventory   
            displayProducts();
        } else if (answer.choice === "View Low Inventory") {
            //view low inventory
            lowInventory();
        } else if (answer.choice === "Add Inventory") {

        } else {

        }

    })

}

//function that shows current inventory
function displayProducts() {
    connection.query("SELECT * FROM products_list",
        function (err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++) {
                console.log("ItemId:  " + res[i].item_id + " | " + "Name: " + res[i].product_name + "  |   " + "Price : " + "$" + res[i].price + " | " + "Quantity: " + res[i].stock_quantity);
            }
            newSearchOrLeave();
        });
}

function lowInventory() {
    connection.query("SELECT * FROM products_list WHERE stock_quantity <= 5 ",
        function (err, res) {
            if (err) throw err;
            /*display any inventory that has a quantity less than 5*/
            if (res.length > 0) {
                for (var i = 0; i < res.length; i++) {
                    console.log("ItemId:  " + res[i].item_id + " | " + "Name: " + res[i].product_name + "  |   " + "Price : " + "$" + res[i].price + " | " + "Quantity: " + res[i].stock_quantity);
                }
            } else {
            //all items in the inventory has more than 5 quantity.
                console.log("Inventory Fully Stocked");
            }
            newSearchOrLeave();
        });
}


//function to see if the manager is done using the app
function newSearchOrLeave() {
    inquirer.prompt([{
        type: "confirm",
        name: "confirm",
        default: "true",
        message: "Do you want to do another transaction? "
    }]).then(function (answer) {
        if (answer.confirm) {
            menu();
        } else {
            console.log("Have a nice day");
        }
    })
}
