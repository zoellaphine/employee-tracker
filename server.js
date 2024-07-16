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
                viewAllEmployees();
                break;
            case 'View all roles':
                viewAllRoles();
                break;
            case 'View all departments':
                viewAllDepartments();
                break;
            case 'Quit':
                connection.end();
                console.log('Connection ended')
        }
    })
}

// update employee role
function updateEmployeeRole() {
    const queryEmployees =
        `SELECT employee.id, employee.first_name, employee.last_name, 
        roles.title FROM employee LEFT JOIN roles ON employee.role_id = roles.id`;
    const queryRoles = 'SELECT * FROM roles';
    connection.query(queryEmployees, (err, resEmployees) => {
        if (err) throw err;
        connection.query(queryRoles, (err, resRoles) => {
            if (err) throw err;
            inquirer.prompt([
                    {
                        type: 'list',
                        name: 'employee',
                        message: 'Select employee',
                        choices: resEmployees.map(
                            (employee) => `${employee.first_name} ${employee.last_name}`
                        )
                    },
                    {
                        type: 'list',
                        name: 'role',
                        message: "Select new role",
                        choices: resRoles.map((role) => role.title)
                    }
            ]).then((answers) => {
                const employee = resEmployees.find(
                    (employee) =>
                        `${employee.first_name} ${employee.last_name}` ===
                        answers.employee
                );
                const role = resRoles.find(
                    (role) => role.title === answers.role
                );
                const query =
                    'UPDATE employee SET role_id = ? WHERE id = ?';
                connection.query(
                    query,
                    [role.id, employee.id],
                    (err, res) => {
                        if (err) throw err;
                        console.log(
                            `Updated ${employee.first_name} ${employee.last_name}'s role to ${role.title} in the database!`
                        );
                        // restart
                        start();
                    }
                );
            });
        });
    });
}

// add employee
function addEmployee() {
    connection.query('SELECT id, title FROM roles', (err, results) => {
        if (err) {
            console.error(err);
            return;
        }

        const roles = results.map(({id, title}) => ({
            name: title,
            value: id,
        }));

        connection.query(
            'SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee',
            (err, results) => {
                if (err) {
                    console.error(err);
                    return;
                }

                const managers = results.map(({id, name}) => ({
                    name,
                    value: id
                }));

                inquirer.prompt([
                        {
                            type: 'input',
                            name: 'firstName',
                            message: 'Enter employee first name'
                        },
                        {
                            type: 'input',
                            name: 'lastName',
                            message: 'Enter employee last name'
                        },
                        {
                            type: 'list',
                            name: 'roleId',
                            message: 'Select employee role',
                            choices: roles
                        },
                        {
                            type: 'list',
                            name: 'managerId',
                            message: 'Select employee manager',
                            choices: [
                                { name: 'None', value: null },
                                ...managers
                            ]
                        }
                ]).then((answers) => {
                    const sql =
                        'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
                    const values = [
                        answers.firstName,
                        answers.lastName,
                        answers.roleId,
                        answers.managerId,
                    ];
                    connection.query(sql, values, (err) => {
                        if (err) {
                            console.error(err);
                            return;
                        }

                        console.log('Employee added');
                        // restart
                        start();
                    });
                }).catch((err) => {
                    console.error(err);
                });
            }
        );
    });
}

// add role
function addRole() {
    const query = 'SELECT * FROM departments';
    connection.query(query, (err, res) => {
        if (err) throw err;
        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the title of the new role:'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the salary of the new role:'
            },
            {
                type: 'list',
                name: 'department',
                message: 'Select the department for the new role:',
                choices: res.map(
                    (department) => department.department_name
                )
            }
        ]).then((answers) => {
            const department = res.find(
                (department) => department.name === answers.department
            );
            const query = 'INSERT INTO roles SET ?';
            connection.query(
                query,
                {
                    title: answers.title,
                    salary: answers.salary,
                    department_id: department
                },
                (err, res) => {
                    if (err) throw err;
                    console.log(
                        `Added role ${answers.title} with salary ${answers.salary} 
                        to the ${answers.department} department in the database!`
                    );
                    // restart
                    start();
                }
            );
        });
    });
}

// add department
function addDepartment() {
    inquirer
        .prompt({
            type: "input",
            name: "name",
            message: "Enter the name of the new department:",
        })
        .then((answer) => {
            console.log(answer.name);
            const query = `INSERT INTO departments (department_name) VALUES ("${answer.name}")`;
            connection.query(query, (err, res) => {
                if (err) throw err;
                console.log(`Added department ${answer.name} to the database!`);
                // restart
                start();
                console.log(answer.name);
            });
        });
}

// view all employees
function viewAllEmployees() {
    const query = 
        `SELECT e.id, e.first_name, e.last_name, r.title, d.department_name, r.salary, 
        CONCAT(m.first_name, ' ', m.last_name) AS manager_name
        FROM employee e
        LEFT JOIN roles r ON e.role_id = r.id
        LEFT JOIN departments d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        // restart
        start();
    });
}

// view all roles
function viewAllRoles() {
    const query = `SELECT roles.title, roles.id, departments.department_name, 
        roles.salary from roles join departments on roles.department_id = departments.id`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        // restart
        start();
    });
}

// view all departments
function viewAllDepartments() {
    const query = 'SELECT * FROM departments';
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        // restart 
        start();
    });
}