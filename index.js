const inquirer = require("inquirer");
const mysql = require("mysql");
// const server = require("./mysql-server");
const cTable = require('console.table');

const main = async () => {

  const welcome = `   ____           __                 
  / __/_ _  ___  / /__  __ _____ ___ 
 / _//  ' \\/ _ \\/ / _ \\/ // / -_) -_)
/___/_/_/_/ .__/_/\\___/\\_, /\\__/\\__/ 
    __  __/_/         /___/          
   /  |/  /__ ____  ___ ____ ____ ____
  / /|_/ / _ \`/ _ \\/ _ \`/ _ \`/ -_) __/
 /_/  /_/\\_,_/_//_/\\_,_/\\_, /\\__/_/   
                       /___/                    `
  console.log(welcome);

  const run = async () => {
  let getMain = await require("./questions").getMain();
  let main =  getMain.main;
  let questions =  getMain.questions;

  // const addDept = async (ret = false) => {
  //   let dept = await inquirer.prompt(questions.addDept);
  //   // needs to add dept before moving on (e.g. needs depts to add role)
  //   await server.addToTable("departments", ["name", dept.deptName])
  //   console.log(`This is the new list of departments:`)
  //   await server.print("departments", "id", "name");
  //   if (ret) return server.getNameAndId('departments','id','name');
  // }

  // const addRole = async () => {
  //   const {role, salary, dept} = await inquirer.prompt(questions.addRole);
  //   // await addRole(role.role, role.salary, role.dept);
  //   await server.addToTable("roles", ["title", role],["salary", salary], ["department_id", dept])
  //     console.log(`This is the new list of roles:`)
  //   await server.print("roles join departments on roles.department_id = departments.id", "roles.title","departments.name as department","roles.salary");
  // }

  // const addEmployee = async (empName, role_id, mgr_id) => {
  //   let first; let last;
  //   if (empName.split(",").length == 2)  {
  //     first = empName.split(",")[1].trim();
  //     last = empName.split(",")[0].trim();
  //   } else if (empName.split(" ").length == 2)  {
  //     first = empName.split(" ")[0].trim();
  //     last = empName.split(" ")[1].trim();
  //   }
  //   server.addToTable("employees", ["first_name", first],["last_name", last], ["role_id", role_id],["manager_id", mgr_id])
  //   console.log(`This is the new list of employees:`)
  //   server.print("employees JOIN roles ON employees.role_id = roles.id", "employees.id", "first_name", "last_name","title");
  // }

  // const delEmployee = async (...ids) => {
  //   console.log(`The following employees have been deleted from the database`);
  //   server.print(`employees WHERE id IN (${ids.join()})`,`first_name`, `last_name`)
  //   ids.map(id => {
  //     server.delFromTable("employees", "id", id)
  //   });
  // }

  // const printDept = async () => {
  //   const vdept = await inquirer.prompt(questions.viewDept);
  //   server.print(`employees JOIN roles ON employees.role_id = roles.id JOIN departments ON departments.id = roles.department_id WHERE departments.id = ${vdept.deptToView}`,'first_name','last_name','name AS department','title','salary')
  // }

  // const printRole = async () => {
  //   const vrole = await inquirer.prompt(questions.viewRole);
  //   server.print('roles JOIN departments ON roles.department_id = departments.id','title','salary','name')
  // }

  // const printEmployees = async () => {
  //   const vEmp = await inquirer.prompt(questions.viewEmployee);
  //   server.print("employees JOIN roles ON employees.role_id = roles.id", "employees.id", "first_name", "last_name","title");
  // }

    const answers = await inquirer
      // ask starting questions...
      .prompt(questions.start)

      // then act according to selection
        switch (answers.start) {
          case "Add department.":
            await main.addDept();
            break;
          case "Add role.":
            await main.addRole();
            break;
          case "Add employee.":
            await main.addEmployee()
            break;
          case "View departments.":
            await main.printDept();
            break;
          case "View roles.":
            await main.printRole();
            break;
          case "View employees.":
            await main.printEmployees()
            break;
          case "View dept. budget (i.e. combined salaries for a department).":
            inquirer.prompt(questions.addDept);
            break;
          case "Update employee role.":
            await main.updateEmpRole();
            break;
          case "Update employee manager.":
            await main.updateManager();
            break;
          case "Delete department.":
            await main.delDept();
            break;
          case "Delete roles.":
            inquirer.prompt(questions.delRole);
            break;
          case "Delete employees.":
            const delEmps = await inquirer.prompt(questions.delEmps);
            await main.delEmployee(...delEmps.empsToBeDel);
            break;
          case "exit":
            console.log("goodbye")
            // connection.end();
            break;
          } 

          run()
  }

  run()

}

main();
