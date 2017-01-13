//jshint esversion:6
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

    console.log("\n Connected to Bamazon \n");
    start();
});

function start() {
	var question = [
		{
			name: 'menuChoice',
			type: 'list',
			message: 'Choose an option: ',
			choices: 
			[
				'View Products for Sale',
				'View Low Inventory',
				'Add to Inventory',
				'Add New Product',
				'Exit'
			]
		}
	];

	inquirer.prompt(question).then( (choice) => {
		runChoice(choice.menuChoice);
	});
}

function runChoice(choice) {

	switch (choice) {
		case 'View Products for Sale':
			showAllItems();
			break;
		case 'View Low Inventory':
			showLowStock();
			break;
		case 'Add to Inventory':
			addToInventory();
			break;
		case 'Add New Product':
			addNewItem();
			break;
		case 'Exit':
			connection.end();
			break;
	}
}

function showAllItems() {
	connection.query('SELECT * FROM Products', (err, res) => {
		if (err) throw err;

		console.table('Our Products',res);
		start();
	});
}

function showLowStock() {
	connection.query('SELECT * FROM Products WHERE StockQuantity < 5', (err, res) => {
		if (err) throw err;

		console.table('Low Inventory',res);
		start();
	});
}

function addToInventory() {

	var questions = [
		{
			type: 'input',
   			name: 'itemID',
   			message: 'Please enter the ID of the Item to re-order',
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
			message: 'How much stock would you like to order?',
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
		connection.query('SELECT * FROM Products', (err, res) => {
			if (err) throw err;

			var idList = [];

			//list of all ID's in DB table
			for (var i = 0; i < res.length; i++) {
				idList.push(res[i].itemID);
			}

			answers.itemID = parseInt(answers.itemID);
			answers.quantity = parseInt(answers.quantity);

			//compare user input to itemID's in DB table
			if (idList.includes(answers.itemID)) {

				reStockItem(answers);

			} else {

				console.log("Item ID does not exist!");
				addToInventory();
			}
		
		});

	});
}

function reStockItem(answers) {
	let query = 'UPDATE Products Set StockQuantity = StockQuantity + ? WHERE itemID = ?';

	connection.query( query, [answers.quantity,answers.itemID], (err, res) => {
		if (err) throw err;

		console.log("\n Item restocked \n");
		start();		
	});
}

function addNewItem() {

	let newItemPrompt = [
		{
			name: 'ProductName',
			type: 'input',
			message: 'Enter name of product',
		},
		{
			name: 'Price',
			type: 'input',
			message: 'Enter price of product',
			validate: function (value) {
				if(!isNaN(value)) {
					return true;
				}
				else {
					console.log('\n must be a number \n');
				}
			},
		},
		{
			name: 'StockQuantity',
			type: 'input',
			message: 'Enter Quantity of product to stock',
			validate: function (value) {
				if(!isNaN(value)) {
					return true;
				}
				else {
					console.log('\n must be a number \n');
				}
			},
		},
		{
			name: 'DepartmentName',
			type: 'input',
			message: 'Enter name of Department for product',
		}
	];

	inquirer.prompt(newItemPrompt).then( (newItem) => {

		let query = 'INSERT INTO `Products` (`ProductName`, `Price`, `StockQuantity`, `DepartmentName`) VALUES (?, ?, ?, ?);';
		let data = [newItem.ProductName, newItem.Price, newItem.StockQuantity, newItem.DepartmentName];

		connection.query( query, data, (err, res) => {
			if (err) throw err;

			console.log("\n New item added \n");
			start();		
		});

	});
}