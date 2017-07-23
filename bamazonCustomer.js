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
    customerBuy();
});

//function that show current items for sale
function displayProducts() {
    connection.query("SELECT * FROM products_list", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log("ItemId:  " + res[i].item_id + " | " + "Name: " + res[i].product_name + "  |   " + "Price : " + "$" + res[i].price);
        }
    });
}

//function that take the customer order.
function customerBuy() {
    displayProducts();
    var currentItem;
    connection.query("SELECT * FROM products_list", function (err, res) {
        if (err) throw err;
    inquirer.prompt([
            {
                name: "productId",
                type: "input",
                message: "Please enter the itemId of the product you wish to purchase:",
                validate: function (value) {
                //does the id exist in mySQL table
                    for (var i = 0; i < res.length; i++) {
                        if (value == res[i].item_id) {
                            currentItem = res[i];
                            return true;
                        }
                    }return "Please enter valid id.";
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
            updateQuantity(answer.productId, answer.quantity);
        })
    });
}

/*function that update the stock quantity in mySQL and calculate total cost of the transaction.*/
function updateQuantity(id, amount) {
    //making sure the right values was inherit
    //console.log(id + " " + amount);
    connection.query("Select * from products_list Where ?", [{
            //selecting only the item information that the user picked
            item_id: id
                     }],
        function (err, res) {
            if (err) throw err;

            //check if only the picked item data was retrive.
            //console.log(res);

            /*data that was retrive from mySQL and store into variables that will be use later */
            var newQuantity = res[0].stock_quantity - amount;
            var itemId = res[0].item_id;
            var name = res[0].product_name;
            var price = res[0].price;
            var cost = res[0].price * amount;

            //making sure the varaiable data was correct  
            //console.log(itemId); 
            //console.log(newquantity);
            //console.log(cost);

            connection.query("Update products_list Set ? Where ?", [
                {
                    stock_quantity: newQuantity
                    }, {
                    item_id: itemId
                        }
            ], function (err, res) {
                if (err) throw err;
                //print the receipt 
                console.log("--------------------");
                console.log("Bamazon Receipt");
                console.log("   ");
                console.log(amount + " " + name + " cost " + price + " each.");
                console.log("Total amount $" + cost);
                console.log("--------------------");
                inquirer.prompt([{
                    type: "confirm",
                    message: "Do you want to buy something else?",
                    name: "confirm",
                    default: true
                }]).then(function (answer) {
                    //user want to continue shopping 
                    if (answer.confirm) {
                        console.log("Do you want to make another order");
                        customerBuy();
                    } else {
                        //user done with shopping
                        console.log("Thank you for shopping at Bamazon. Have a nice day.");
                    }
                })
            })
        });
}
