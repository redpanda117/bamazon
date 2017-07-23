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
    displayProducts();
});

function displayProducts() {
    connection.query("SELECT * FROM products_list", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].item_id + "  " + res[i].product_name + "  " + res[i].department_name + " " + res[i].price);
        }
    });
    customerBuy();
}

function customerBuy() {
    var currentItem;
    connection.query("SELECT * FROM products_list", function (err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "productId",
                type: "input",
                message: "Please enter the itemId of the product you wish to purchase:",
                validate: function (value) {
                    for (var i = 0; i < res.length; i++) {
                        if (value == res[i].item_id) {
                            currentItem = res[i];
                            return true;
                        }
                    }
                }
         }, {
                name: "quantity",
                type: "input",
                message: "How many do you want?",
                validate: function (value) {
                    //see if it is not a number
                    if (isNaN(value) == true) {
                        return "Please enter a valid number";
                    } else if (value % 1 != 0) {
                        //if person enter a whole number because whole number will not have a remainder.
                        return "Please enter a whole number.";
                    } else if (value <= 0) {
                        //is the number greater than zero.So number cannot be zero or a negative number.
                        return "Please enter a valid quantity";
                    } else if (value > currentItem.stock_quantity) {
                        //is there enough quantity in stock.
                        return "We don't have enough inventory to complete your order. " + currentItem.stock_quantity + " remaining."
                    } else {
                        return true;
                    }
                }
                    }
                ]).then(function (answer) {
            console.log("works");
        })
    });
}
