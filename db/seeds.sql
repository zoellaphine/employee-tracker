INSERT INTO departments (id, department_name)
VALUES 
(001, 'Engineering'),
(002, 'Finance'),
(003, 'Legal'),
(004, 'Sales');

INSERT INTO roles (title, salary, department_id)
VALUES 
('Sales Lead', 900000.00, 1),
('Lead Engineer', 175000.00, 2),
('Software Engineer', 200000.00, 3),
('Account Manager', 182000.00, 4),
('Legal Team Lead', 185000.00, 4),
('Accountant', 145000.00, 2),
('Salesperson', 80000.00, 4),
('Lawyer', 185000.00, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('John', 'Doe', 1, 1),
('Mike', 'Chan', 2, 2),
('Ashley', 'Rodriguez', 3, 3),
('Kevin', 'Tupik', 4, 4),
('Kunal', 'Singh', 5, 5),
('Malia', 'Brown', 6, NULL),
('Sarah', 'Lourd', 7, NULL),
('Tom', 'Allen', 8, NULL);