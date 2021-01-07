const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'f0rcheTTes*',
  database: 'employee_manager_db',
});

const getNameAndId = (table, id = "id", ...names) => {
  return new Promise ((resolve, reject) => {
    connection.query(`SELECT * FROM ${table}`, async (err, res) => {
    if (err) reject(err);
    const r = res.map(packet => ({ name: 
      names.map( name => packet[name]).join(' '), value: packet[id]}));
    return resolve(r);
    }); 
  })
}

const print = (table, ...headings) => {
    connection.query(`SELECT ${headings.join(",")} FROM ${table}`, (err, res) => {
    if (err) throw err;
    console.log(`This is the new list of ${table.split(" ")[0]}.`); 
    console.table(res);
  })   
}; 

const addToTable = (table, ...items) => {
  console.log(`Adding ${items[0][1]} to the list of ${table}.`);
  connection.query(`INSERT INTO ${table} (${items.map(item => item[0]).join(",")}) values("${items.map(item => item[1]).join("\",\"")}")`,
    (err, res) => {
      if (err) throw err;
  });
  
}

const delFromTable = (table, target, item) => {
  // console.log(`Deleting ${target} ${item} from ${table}.`);
  connection.query(`DELETE FROM ${table} WHERE ${target} = "${item}"`,
    (err, res) => {
      if (err) throw err;
  });
  
}
// SELECT name as department FROM  departments WHERE departments.id = 2

// select roles.title,departments.name as department  from roles join departments on roles.department_id = departments.id;

const addDept = async (name) => {
  addToTable("departments", ["name", name])
  print("departments", "id", "name");
}

const addRole = async (title, salary, dept) => {
  addToTable("roles", ["title", title],["salary", salary], ["department_id", dept])
  print("roles join departments on roles.department_id = departments.id", "roles.title","departments.name as department","roles.salary");
}

const addEmployee = async (empName, role_id, mgr_id) => {
  let first; let last;
  if (empName.split(",").length == 2)  {
    first = empName.split(",")[1].trim();
    last = empName.split(",")[0].trim();
  } else if (empName.split(" ").length == 2)  {
    first = empName.split(" ")[0].trim();
    last = empName.split(" ")[1].trim();
  }
  addToTable("employees", ["first_name", first],["last_name", last], ["role_id", role_id],["manager_id", mgr_id])
  print("employees", "id", "first_name", "last_name");
}

const delEmployee = async (...ids) => {
  // because I can't figure out how to get the name from inquirer in the response :/
  connection.query(`SELECT first_name, last_name FROM employees WHERE id IN (${ids.join()})`, (err, res) => {
    if (err) throw err;
    names = res.map(name => name.first_name + ' ' + name.last_name);
    console.log(`Deleting ${names} from the database`)
  }); 
  let names = ids.map(id => {
    delFromTable("employees", "id", id)
  }); console.log(names);
}
  // let deletedEmps = ids.map(id => id.name).join(", ")
  // console.log('The employees', deletedEmps, 'have been removed from the system')

module.exports = {
  connection,
  addDept,
  addRole,
  getNameAndId,
  addEmployee,
  delEmployee,
}
