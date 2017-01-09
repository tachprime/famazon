const userPass = require('./userPass.js');
const inquirer = require('inquirer');
const mysql = require('mysql');

var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: userPass.password,
	databse: 'Bamazon'
});

connection.connect((err) => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
});