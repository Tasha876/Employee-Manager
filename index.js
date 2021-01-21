const inquirer = require("inquirer");
const mysql = require("mysql");
const { connection } = require("./mysql-server");

const cTable = require('console.table');
const { server } = require("./mysql-server");

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
  let getMain = await require("./main_functions")();
  let main =  getMain;
  let getQuestions = await require("./questions")();
  let questions =  getQuestions;

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
            await main.viewBudget();
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
          case "Delete employee.":
            await main.delEmployee();
            break;
          case "exit":
            console.log("goodbye")
            return;
          } 

          run()
  }

  run()

}

server.createTables();

main();
