const mysql = require('mysql');

// const connection = mysql.createConnection({
//   host: 'localhost',
//   port: 3306,
//   user: 'root',
//   password: '',
//   database: 'employee_manager_db',
// });

const connection = mysql.createConnection({
  host: 'db4free.net',
  port: 3306,
  user: 'natasha321',
  password: 'l00p33123',
  database: 'employee_manager',
});

const server = {
  createTables () {
    let createRoles = 
    `CREATE TABLE if not exists 
    departments (
      id INT auto_increment, 
      name VARCHAR(30), 
      PRIMARY KEY(id))`
    let createDepartments = 
    `CREATE TABLE if not exists 
    roles (
      id INT auto_increment,
      title VARCHAR(30),
      salary DECIMAL(12,2),
      department_id INT,
      PRIMARY KEY (id),
      FOREIGN KEY (department_id),
        REFERENCES departments (id)`
    let createEmployees =
      `CREATE TABLE if not exists 
      employees (
      id INT auto_increment,
      first_name VARCHAR(30),
      last_name VARCHAR(30),
      role_id INT,
      manager_id INT,
      PRIMARY KEY(id),
      FOREIGN KEY (role_id)
        REFERENCES roles (id),
      FOREIGN KEY (manager_id)
        REFERENCES employees(id))`
    connection.query(createRoles, (err,res) => {
      if (err) throw err;
    });
    connection.query(createDepartments, (err,res) => {
      if (err) throw err;
    });
    connection.query(createEmployees, (err,res) => {
      if (err) throw err;
    });
  },

  print (table, ...headings) {
      connection.query(`SELECT ${headings.join(",")} FROM ${table}`, (err, res) => {
      if (err) throw err;
      console.table(res);
    })   
  },

  addToTable (table, ...items) {
    console.log(`Adding ${items[0][1]} to the list of ${table}.`);
    connection.query(`INSERT INTO ${table} (${items.map(item => item[0]).join(",")}) values("${items.map(item => item[1]).join("\",\"")}")`,
      (err, res) => {
        if (err) throw err;
    });
  },

  delFromTable (table, target, item) {
    // console.log(`Deleting ${target} ${item} from ${table}.`);
    connection.query(`DELETE FROM ${table} WHERE ${target} = "${item}"`,
      (err, res) => {
        if (err) throw err;
    }); 
  },

  getNameAndId (table, id = "id", ...names) { 
    return new Promise ((resolve, reject) => {
      connection.query(`SELECT * FROM ${table}`, async (err, res) => {
      if (err) reject(err);
      const r = res.map(packet => ({ name: 
        names.map( name => packet[name]).join(' '), value: packet[id]}));
      return resolve(r);
      }); 
    })
  }
};

connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}\n`);
});

module.exports = server;
