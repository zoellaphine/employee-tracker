const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME 
})

// connect to database to start project
connection.connect((err) => {
    try {
        start(); 
    } catch (err) {
        console.error(err);
    }
})

console.log(
    `
     ____  __  __  ____  __    _____  _  _  ____  ____ 
    ( ___)(  \/  )(  _ \(  )  (  _  )( \/ )( ___)( ___)
    )__)  )    (  )___/ )(__  )(_)(  \  /  )__)  )__) 
    (____)(_/\/\_)(__)  (____)(_____) (__) (____)(____)
     __  __    __    _  _    __    ___  ____  ____ 
    (  \/  )  /__\  ( \( )  /__\  / __)( ___)(  _ \
    )    (  /(__)\  )  (  /(__)\( (_-. )__)  )   /
    (_/\/\_)(__)(__)(_)\_)(__)(__)\___/(____)(_)\_)
    `
)

// actual function for employee manager application
function start() {
    inquirer.prompt({
        type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'Update employee role',
                'Add employee',
                'Add role',
                'Add department',
                'View all employees',
                'View all roles',
                'View all departments',
                'Quit'
            ]
    }).then((response) => {
        switch (response.action) {
            case 'Update employee role':
                updateEmployeeRole();
                break;
            case 'Add employee':
                addEmployee();
                break;
            case 'Add role':
                addRole();
                break;
            case 'Add department':
                addDepartment();
                break;
            case 'View all employees':
                viewEmployees();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all departments':
                viewDepartments();
                break;
            case 'Quit':
                connection.end();
                console.log('Connection ended')
        }
    })
}

// function for response 'Update employee role'
function updateEmployeeRole() {
    const reqEmployees =
        `SELECT employee.id, employee.first_name, employee.last_name, 
        roles.title FROM employee LEFT JOIN roles ON employee.role_id = roles.id`;
    const reqRoles = 'SELECT * FROM roles';
    connection.query(reqEmployees, (err, resEmployees) => {
        if (err) throw err;
        connection.query(reqRoles, (err, resRoles) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee',
                    message: 'What employee\'s role do you want to update?',
                    choices: resEmployees.map(
                        (employee) => `${employee.first_name} ${employee.last_name}`
                    )
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'Which role do you want to assign the selected employee?',
                    choices: resRoles.map((role) => role.title),
                }
            ]).then((response) => {
                const employee = resEmployees.find(
                    (employee) =>
                        `${employee.first_name} ${employee.last_name}` ===
                        answers.employee
                );
                const role = resRoles.find(
                    (role) => role.title === response.role
                );
                const query =
                    'UPDATE employee SET role_id = ? WHERE id = ?';
                connection.query(
                    query,
                    [role.id, employee.id],
                    (err, res) => {
                        if (err) throw err;
                        console.log(
                            `Updated ${employee.first_name} ${employee.last_name}'s role to ${role.title}ß`
                        );
                        start();
                    }
                );
            })
        });
    });
}