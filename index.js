const inquirer = require("inquirer");
const mysql = require("mysql");

const questions = {
  start: {
    name: "start",
    type: "list",
    message: "What would you like to do?",
    choices: [
      "Add department.",
      "Add role.",
      "Add employee.",
      new inquirer.Separator(),
      "View departments.",
      "View roles.",
      "View employees.",
      "View dept. budget (i.e. combined salaries for a department).",
      new inquirer.Separator(),
      "Update employee role.",
      "Update employee manager.",
      new inquirer.Separator(),
      "Delete department.",
      "Delete roles.",
      "Delete empoyees."
     ]
  },
  addDept: {
    name: "deptName",
    type: "input",
    message: "What is the name of the dept?"
  },
  addRole: {
    name: "role",
    type: "input",
    message: "Which role would you like to add?"
  },
  addAndAssign: [
    {
      name: "empName",
      type: "input",
      message: "What is the employees name"
    },
    {
      name: "role",
      type: "input",
      message: "Which role would you like to assign?",
      choices: []
    }
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
    message: "For what department?",
    choices: []
  },
  updateRole: [
    {
      name: "empToBePromoted",
      type: "list",
      message: "For what employee?",
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
      message: "Which manager?",
      choices: []
    },
    {
      name: "empToGetNewMgr",
      type: "checkbox",
      message: "Which employee(s)?",
      choices: []
    }
  ],
  delDept: {
    name: "deptNames",
    type: "checkbox",
    message: "Which department(s)?",
    choices: []
  },
  delRole: {
    name: "rolesToBeDel",
    type: "checkbox",
    message: "Which role(s)?",
    choices: []
  },
  delEmps: {
    name: "empsToBeDel",
    type: "checkbox",
    message: "Which employees?",
    choices: []
  }
};

inquirer
  .prompt(questions.start)
  .then(answers => { 
    switch(answers.start) {
        case "Add department.":
        inquirer.prompt(questions.addDept);
        break;
        case "Add role.":
        inquirer.prompt(questions.addRole);
        break;
        case "Add employee.":
        inquirer.prompt(questions.addAndAssign);
        break;
        case"View departments.":
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
        case "Delete empoyees.":
        inquirer.prompt(questions.delEmps);
      }
    });
