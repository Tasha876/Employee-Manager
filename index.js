const inquirer = require("inquirer");
const mysql = require("mysql");
const { connection, addEmployee } = require("./mysql-server");

const cTable = require('console.table');

const server = require('./mysql-server');

// class questionToAsk {
//   constructor(question) {
//     this.askQuestion = () => question;
//   }
// }

// let q1 = new questionToAsk(
//     {
//     name: "deptName",
//     type: "input",
//     message: "What is the name of the dept?"
//     }
// )

// const main = async () => {
//   answer = await inquirer.prompt(q1.askQuestion()); 
//   return answer;
// }

// main()

const run = async () => {
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
  
  const askQuestions = async () => {

  // list of questions that will be prompted by Inquirer
  const questions = {
    start: {
      name: "start",
      type: "list",
      message: "What would you like to do?",
      choices: [
        new inquirer.Separator('------Add-----'),
        "Add department.",
        "Add role.",
        "Add employee.",
        new inquirer.Separator('-----View-----'),
        "View departments.",
        "View roles.",
        "View employees.",
        "View dept. budget (i.e. combined salaries for a department).",
        new inquirer.Separator('----Update----'),
        "Update employee role.",
        "Update employee manager.",
        new inquirer.Separator('----Delete----'),
        "Delete department.",
        "Delete roles.",
        "Delete employees."
      ]
    },
    addDept: {
      name: "deptName",
      type: "input",
      message: "What is the name of the dept?"
    },
    addRole: [
      {
      name: "role",
      type: "input",
      message: "Which role would you like to add?"
      },
      {
        name: "dept",
        type: "list",
        message: "Which dept does this role belong to?",
        choices: await server.getNameAndId('departments','id','name'),
      },
      {
        name: "salary",
        type: "number",
        message: "What salary will this role get?",
      }
    ],
    addAndAssign: [
      {
        name: "name",
        type: "input",
        message: "What is the employees name. Enter either as Last, First or as First Last",
        validate: async name => {
          let valid = await name.match(/^([\w-]+(\s){1}[\w-]+'?[\w-]*)$|^(([\w\s-]+'?[\w\s-]*))*(,){1}[\w\s-]+$/g);
          if (!valid) return 'Please enter the name in the required format, for names with a space in the first or last name, please use Last, First.';
          else return true;
        } 
      },
      {
        name: "dept",
        type: "list",
        message: "Which department would you like to assign to this employee?",
        choices: await server.getNameAndId('departments','id','name'),
      },
      {
        name: "role",
        type: "list",
        message: "Which role would you like to assign to this employee?",
        choices: async answers => {
          let table = `roles  where roles.department_id = ${answers.dept}`;
          return await server.getNameAndId(table, 'id', 'title');
        },
      },
    ],
    viewDept: {
      name: "deptToView",
      type: "list",
      message: "Which department would you like to view?",
      choices: []
    },
    viewRole: {
      name: "roleToView",
      type: "list",
      message: "Which role would you like to view?",
      choices: []
    },
    viewEmployee: {
      name: "EmpToView",
      type: "list",
      message: "Which employee's information would you like to see?",
      choices: []
    },
    viewBudget: {
      name: "EmpToView",
      type: "list",
      message: "Which department's budget would you like to view?",
      choices: []
    },
    updateRole: [
      {
        name: "empToBePromoted",
        type: "list",
        message: "Who's role would you like to update?",
        choices: []
      },
      {
        name: "roleChange",
        type: "list",
        message: "which role should this employee be assigned?",
        choices: []
      }
    ],
    updateManager: [
      {
        name: "mgrToGetNewEmp",
        type: "list",
        message: "Which manager would you like to assign the employee to?",
        choices: []
      },
      {
        name: "empToGetNewMgr",
        type: "checkbox",
        message: "Which employee(s) would you like to assign to this manager?",
        choices: []
      }
    ],
    delDept: {
      name: "deptNames",
      type: "checkbox",
      message: "Which department(s) would you like to delete?",
      choices: []
    },
    delRole: {
      name: "rolesToBeDel",
      type: "checkbox",
      message: "Which role(s) would you like to delete?",
      choices: []
    },
    delEmps: {
      name: "empsToBeDel",
      type: "checkbox",
      message: "Which employees would you like to delete?",
      choices: await server.getNameAndId('employees','id','first_name','last_name'),
    }
  };

    const answers = await inquirer

      // ask starting questions...
      .prompt(questions.start)

      // then act according to selection
        switch (answers.start) {
          case "Add department.":
              const dept = await inquirer.prompt(questions.addDept);
              // needs to add dept before moving on (e.g. needs depts to add role)
              await server.addDept(dept.deptName);
              break;
          case "Add role.":
            const role = await inquirer.prompt(questions.addRole);
            await server.addRole(role.role, role.salary, role.dept);
            break;
          case "Add employee.":
            const emp = await inquirer.prompt(questions.addAndAssign);
            await server.addEmployee(emp.name, emp.role, 1);
            break;
          case "View departments.":
            inquirer.prompt(questions.viewDept);
            break;
          case "View roles.":
            inquirer.prompt(questions.viewRole);
            break;
          case "View employees.":
            inquirer.prompt(questions.viewEmployee);
            break;
          case "View dept. budget (i.e. combined salaries for a department).":
            inquirer.prompt(questions.addDept);
            break;
          case "Update employee role.":
            inquirer.prompt(questions.updateRole);
            break;
          case "Update employee manager.":
            inquirer.prompt(questions.updateManager);
            break;
          case "Delete department.":
            inquirer.prompt(questions.delDept);
            break;
          case "Delete roles.":
            inquirer.prompt(questions.delRole);
            break;
          case "Delete employees.":
            const delEmps = await inquirer.prompt(questions.delEmps);
            await server.delEmployee(...delEmps.empsToBeDel);
            break;
          case "exit":
            console.log("goodbye")
            connection.end();
            break;
          } 

        askQuestions();

      }

      askQuestions()

}

server.connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${server.connection.threadId}\n`);
  run();
});

// module.exports = run;