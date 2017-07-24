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
        } else if (answer.choice === "View Low Inventory") { //view low inventory
            lowInventory();
        } else if (answer.choice === "Add Inventory") {
            /*function for user input which inventory person want to add*/
            whichAddInventory();
        } else {
            newProductInfo();
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

/*function that display any low inventory or if it is fully stock*/
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

//input what inventoy user want to add
function whichAddInventory() {
    var currentItem;
    connection.query("SELECT * FROM products_list", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log("ItemId:  " + res[i].item_id + " | " + "Name: " + res[i].product_name + "  |   " + "Quantity: " + res[i].stock_quantity);
        }
        inquirer.prompt([
            {
                name: "productId",
                type: "input",
                message: "Please enter the itemId of the product you wish to restock:",
                validate: function (value) {
                    //does the id exist in mySQL table
                    for (var i = 0; i < res.length; i++) {
                        if (value == res[i].item_id) {
                            currentItem = res[i];
                            return true;
                        }
                    }
                    return "Please enter valid id.";

                }
         }, {
                name: "quantity",
                type: "input",
                message: "How much do you want?",
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

//Adding to the stock inventory 
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
            var newQuantity = parseInt(res[0].stock_quantity) + parseInt(amount);
            var itemId = res[0].item_id;

            //making sure the varaiable data was correct  
            //console.log(itemId); 
            //console.log(newquantity);

            connection.query("Update products_list Set ? Where ?", [
                {
                    stock_quantity: newQuantity
                    }, {
                    item_id: itemId
                        }
            ], function (err, res) {
                if (err) throw err;
                //confirm inventory has been updated 
                console.log("--------------------");
                console.log("Inventory Added Sucessful");
                console.log("--------------------");
                newSearchOrLeave();
            })

        });
}

//getting user input information about new product
function newProductInfo() {
    inquirer.prompt([
        {
            type: "input",
            name: "productName",
            message: "What is the name of the product?",
 }, {
            type: "input",
            name: "department",
            message: "What department does this product belong to?",
            validate: function (value) {
                //see if it has letters only
                if (isNaN(value) == false) {
                    return "Please enter valid letters";
                } else {
                    return true;
                }
            }
 }, {
            type: "input",
            name: "price",
            message: "How much will this product sell for?",
            validate: function (value) {
                //see if it is not a number
                if (isNaN(value) == true) {
                    return "Please enter a valid number";
                } else if (value <= 0) {
                    //is the number greater than zero.So number cannot be zero or a negative number.
                    return "Please enter a valid quantity";
                } else {
                    return true;
                }
            }
 }, {
            type: "input",
            name: "quantity",
            message: "How many quantity do you whant to get?",
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
                } else {
                    return true;
                }
            }
 }]).then(function (answer) {
        addNewProduct(answer.productName, answer.department, answer.price, answer.quantity);
    })
}

//function to add product to the mySQL table
function addNewProduct(name, department, price, quantity) {
    /*making sure the right values are recive
    console.log(name);
    console.log(department);
    console.log(price);
    console.log(quantity);*/
    connection.query("INSERT into products_list SET ?", {
            product_name: name,
            department_name: department,
            price: price,
            stock_quantity: quantity
        },
        function (err, res) {
            //confirm inventory has been updated 
            console.log("--------------------");
            console.log("New Product Has Been  Sucessful Added");
            console.log("--------------------");
            newSearchOrLeave();
        })

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
