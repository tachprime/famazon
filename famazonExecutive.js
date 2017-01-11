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
	inquirer.prompt([
		{
			name: 'menuChoice',
			type: 'list',
			message: 'Choose an option: ',
			choices: 
			[
				'View Product Sales by Department',
				'Create New Department',
				'Exit'
			]
		}
	]).then( (choice) => {

		switch(choice.menuChoice) {
			case 'View Product Sales by Department':
				showDepartmentSales();
				break;
			case 'Create New Department':
				createNewDepartment();
				break;
			case 'Exit':
				connection.end();
				break;
		}

	});
}

function showDepartmentSales() {
	let query = 'SELECT *, (TotalSales - OverHeadCosts) AS TotalProfits FROM Departments';

	connection.query(query,(err, res) => {
		console.table("Department Sales",res);
		start();
	});
}

function createNewDepartment() {
	let newDepartmentPrompt = [
		{
			name: 'DepartmentName',
			type: 'input',
			message: 'Enter name of Department',
		},
		{
			name: 'OverHeadCosts',
			type: 'input',
			message: 'Enter cost of department Overhead',
			validate: function(value) {
				if (!isNaN(value)) {
					return true;
				}
				else {
					console.log("\n Please enter a number \n");
				}
			},
			default: function() {
				return 0;
			}
		},
		{
			name: 'TotalSales',
			type: 'input',
			message: 'Enter Total sales for Department',
			validate: function(value) {
				if (!isNaN(value)) {
					return true;
				}
				else {
					console.log("\n Please enter a number \n");
				}
			},
			default: function() {
				return 0;
			}
		}
	];

	inquirer.prompt(newDepartmentPrompt).then( (newDepartment) => {
		let query = 'INSERT INTO `Departments` (`DepartmentName`, `OverHeadCosts`, `TotalSales`) VALUES (?, ?, ?);';
		let data = [newDepartment.DepartmentName, newDepartment.OverHeadCosts, newDepartment.TotalSales];

		connection.query(query, data, (err, res) => {
			if (err) throw err;

			console.log("\n New Department added! \n");
			start();
		});
	});
}