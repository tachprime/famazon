const userPass = require('./userPass.js');
const inquirer = require('inquirer');
const mysql = require('mysql');
require('console.table');

var connection = mysql.createConnection({
	host: 'localhost',
	port: userPass.port,
	user: userPass.userName,
	password: userPass.password,
	database: 'Bamazon'
});

connection.connect((err) => {
    if (err) throw err;

    console.log("Connected to Bamazon\n");
    showItems();
});

function showItems() {
	connection.query('SELECT * FROM Products', function (err, res){
		if (err) throw err;

		console.table('Our Products',res);
		promptUser(res);
	});
}

function promptUser(res) {

	var questions = [
		{
			type: 'input',
   			name: 'itemID',
   			message: 'Please enter the ID of the Item you would like to buy',
   			validate: function(value) {
   				if (!isNaN(value)) {
   					return true;
   				} else {
   					console.log("\n Please enter a proper ID number");
   				}
   			}
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'How many of these would you like to buy?',
			validate: function(value) {
				if(!isNaN(value)) {
					return true;
				} else {
					console.log("\n Please enter a number!");
				}
			}
		}
	];

	inquirer.prompt(questions).then((answers) => {

		var idList = [];

		//list of all ID's in DB table
		for (var i = 0; i < res.length; i++) {
			idList.push(res[i].itemID);
		}

		answers.itemID = parseInt(answers.itemID);
		answers.quantity = parseInt(answers.quantity);

		//compare user input to itemID's in DB table
		if (idList.includes(answers.itemID)) {

			getItem(answers);

		} else {

			console.log("Item ID does not exist!");
			promptUser(res);

		}

	});
}

function getItem(userAnswers) {
	connection.query('SELECT * FROM Products WHERE itemID = ?', [userAnswers.itemID], (err, res) => {

		if (userAnswers.quantity > parseInt(res[0].StockQuantity)) {

			console.log("\n Not enough items in stock \n")
			showItems();

		} else {

			let itemQty = parseInt(res[0].StockQuantity)
			let price = parseFloat(res[0].Price);
			fufillOrder(userAnswers, itemQty, price);
		}
	});
}

function fufillOrder(userAnswers, itemQty, price) {
	let id = userAnswers.itemID;
	let qty = itemQty - userAnswers.quantity;

	connection.query('UPDATE Products Set StockQuantity = ? WHERE itemID = ?', [qty,id], (err,res) => {
		if (err) throw err;

		console.log("\n Sale Completed \n");
		printTotal(userAnswers.quantity, price);
	});
}

function printTotal(qty, price) {
	let total = qty * price;

	console.log("\n Your Purchase Total is: $%d \n", total);
	connection.end();
}

