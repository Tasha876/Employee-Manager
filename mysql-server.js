const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'f0rcheTTes*',
  database: 'employee_manager_db',
});

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
      connection.query(`SELECT ${headings.join()} FROM ${table}`, (err, res) => {
      if (err) throw err;
      res.length?  console.table(res) : console.log(`There is nothing currently in this table`);
      }); return resolve()
    })   
  },

  addToTable (table, ...items) {
    return new Promise ((resolve, reject) => {
      console.log(`Adding ${items[0][1]} to the list of ${table}.`);
      let object = {};
      items.map(item => object[item[0]] = item[1]);
      const query = connection.query(`INSERT INTO ?? SET ?`,
      [table, object],
        (err, res) => {
          if (err)
            throw err;
          
          return resolve(res.insertId);
        }); 
      });
  },

  async delFromTable (table, target, item) {
    connection.query(`DELETE FROM ${table} WHERE ${target} = "${item}"`,
      (err, res) => {
        if (err) throw err;
    }); 
  },

  update (table, field, id, updated) {
    return new Promise ((resolve, reject) => {
      connection.query(`UPDATE ?? SET ? WHERE ??.id = ?`,
      [table,{[field] : updated},table,id],
      (err, res) => {
      if (err) throw err;
      }); 
      return resolve();
    })   
  },

  getNameAndId (table, id, ...names) { 
    return new Promise ((resolve, reject) => {
      connection.query(`SELECT * FROM ${table}`, async (err, res) => {
      let r;
      if (err) reject(err);
      else if (res && res.length) {
        r = res.map(packet => ({ name: 
        names.map( name => packet[name]).join(' '), value: packet[id]}))
        resolve(r);
      } else resolve([{name: 'go back', value: null}]);
      })
    })
  },

  getNameAndIdWhere (mainTable, secondTable, secondTableId, ...names) { 
    return new Promise ((resolve, reject) => {
      let table;
      switch(mainTable) {
        case 'departments': table = 'departments'; break;
        case 'roles': table = 'roles JOIN departments ON departments.id = roles.department_id'; break;
        case 'employees': table = 'employees JOIN roles ON employees.role_id = roles.id JOIN departments ON departments.id = roles.department_id'; break;
      }
      let query = `SELECT ${mainTable}.id, ${names.map(name => mainTable + '.' + name).join()} FROM ${table} WHERE ${secondTable}.id = ${secondTableId}`
      connection.query(query, async (err, res) => {
      if (err) reject(err);
      const r = res.map(packet => ({ name: 
      names.map( name => packet[name]).join(' '), value: packet['id']}));
      return resolve(r);
      }); 
    })
  },

  sum (id) {
    return new Promise ((resolve, reject) => {
      let query = connection.query(`SELECT SUM (salary) AS total_budget FROM employees JOIN roles ON employees.role_id = roles.id JOIN departments ON roles.department_id = departments.id WHERE departments.id = ?`, id, (err, res) => {
        if (err) reject(err);
        console.table(res);
        return resolve(res);
      })
   })
  }
}

module.exports = {
  server,
  connection,
}

