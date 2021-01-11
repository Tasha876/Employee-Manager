const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'f0rcheTTes*',
  database: 'employee_manager_db',
});

// const connection = mysql.createConnection({
//   host: 'db4free.net',
//   port: 3306,
//   user: 'natasha321',
//   password: 'l00p33123',
//   database: 'employee_manager',
// });

const server = {
  createTables () {
    let createDepartments = 
    `CREATE TABLE if not exists 
    departments (
      id INT auto_increment, 
      name VARCHAR(30), 
      PRIMARY KEY(id))`
    let createRoles = 
    `CREATE TABLE if not exists 
    roles (
      id INT auto_increment,
      title VARCHAR(30),
      salary DECIMAL(12,2),
      department_id INT,
      PRIMARY KEY (id),
      FOREIGN KEY (department_id)
        REFERENCES departments (id))`
    let createEmployees =
      `CREATE TABLE if not exists 
      employees (
      id INT auto_increment,
      first_name VARCHAR(30),
      last_name VARCHAR(30),
      role_id INT,
      manager_id INT DEFAULT NULL,
      PRIMARY KEY(id),
      FOREIGN KEY (role_id)
        REFERENCES roles (id),
      FOREIGN KEY (manager_id)
        REFERENCES employees(id));`
    connection.query(createDepartments, (err,res) => {
      if (err) throw err;
    });
    connection.query(createRoles, (err,res) => {
      if (err) throw err;
    });
    connection.query(createEmployees, (err,res) => {
      if (err) throw err;
    });
  },

  print (table, ...headings) {
    return new Promise ((resolve, reject) => {
      connection.query(`SELECT ${headings.join(",")} FROM ${table}`, (err, res) => {
      if (err) throw err;
      res.length?  console.table(res) : console.log(`There is nothing currently in this table`);
      }); return resolve()
    })   
  },

  addToTable (table, ...items) {
    return new Promise ((resolve, reject) => {
      console.log(`Adding ${items[0][1]} to the list of ${table}.`);
      items = items.filter(item => item[1] != '');
      connection.query(`INSERT INTO ${table} (${items.map(item => item[0]).join(",")}) VALUES("${items.map(item => item[1]).join("\",\"")}")`,
        (err, res) => {
          if (err)
            throw err;
          return resolve(res.insertId);
        }); 
      });  
  },

  delFromTable (table, target, item) {
    // console.log(`Deleting ${target} ${item} from ${table}.`);
    connection.query(`DELETE FROM ${table} WHERE ${target} = "${item}"`,
      (err, res) => {
        if (err) throw err;
    }); 
  },

  update (table, field, id, updated) {
    return new Promise ((resolve, reject) => {
      connection.query(`UPDATE ${table} SET ${field} = ${updated} WHERE ${table}.id = ${id}`, (err, res) => {
      if (err) throw err;
      }); return resolve()
    })   
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
  server.createTables();
  console.log(`connected as id ${connection.threadId}\n`);
});

module.exports = server;

