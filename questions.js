const server = require("./mysql-server").server;

const inquirer = require("inquirer");

const getQuestions = async () => {
  
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
        "Delete employee."
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
        name: "salary",
        type: "number",
        message: "What salary will this role get?",
      },
      {
        name: "dept",
        type: "list",
        message: "Which dept does this role belong to?",
        choices: [...await server.getNameAndId('departments','id','name'), 'other', 'go back to start'],
      },
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
        },
        when: answers => !answers.name,
      },
      {
        name: "dept",
        type: "list",
        message: "Which department would you like to assign to this employee?",
        choices: [...await server.getNameAndId('departments','id','name'), 'other', 'go back to start'],
        when: answers => !answers.dept,
      },
      {
        name: "role",
        type: "list",
        message: "Which role would you like to assign to this employee?",
        choices: async answers => {
          let table = `roles  where roles.department_id = ${answers.dept}`;
          return [...await server.getNameAndId(table, 'id', 'title'), 'other', 'go back to start'];
        },
        when: answers => answers.dept !== 'other',
      },
      {
        name: "boss",
        type: "list",
        message: "Which manager would you like to assign to this employee?",
        choices: [...await server.getNameAndId('employees','id','first_name',"last_name"), {value: null, name: 'has no manager'}, 'other','go back to start'],
        when: answers => answers.dept !== 'other' && answers.role !== 'other',
      },
    ],
    viewDept: {
      name: "deptToView",
      type: "list",
      message: "Which department would you like to view?",
      choices: await server.getNameAndId('departments','id','name'),
    },
    viewRole: {
      name: "roleToView",
      type: "list",
      message: "Which role would you like to view?",
      choices: await server.getNameAndId('roles','id','title'),
    },
    viewEmployee: {
      name: "empToView",
      type: "list",
      message: "Which employee's information would you like to see?",
      choices: await server.getNameAndId('employees','id','first_name', 'last_name'),
    },
    viewBudget: {
      name: "dept",
      type: "list",
      message: "Which department's budget would you like to view?",
      choices: await server.getNameAndId('departments','id','name'),
    },
    updateRole: [
      {
        name: "pemp",
        type: "list",
        message: "Who's role would you like to update?",
        choices: await server.getNameAndId('employees','id','first_name', 'last_name'),
      },
      {
        name: "pdept",
        type: "list",
        message: "Which department would you like to assign to this employee?",
        choices: await server.getNameAndId('departments','id','name'),
      },
      {
        name: "prole",
        type: "list",
        message: "which role should this employee be assigned?",
        choices: async answers => {
          let roles = await server.getNameAndId(`roles JOIN departments ON roles.department_id = departments.id WHERE departments.id = ${answers.pdept}`,'id','title');
          return roles;
        }
      }
    ],
    updateManager: [
      {
        name: "mgr",
        type: "list",
        message: "Which manager would you like to assign the employee to?",
        choices: [...await server.getNameAndId('employees','id','first_name', 'last_name'), {value: null, name: 'has no manager'}],
        when: answers => answers.mgr !== null,
      },
      {
        name: "emps",
        type: "checkbox",
        message: "Which employee(s) would you like to assign to this manager?",
        choices: async answers => {
          console.log(answers.mgr);
          console.log('here')
          let mgrs = [...await server.getNameAndId('employees','id','first_name', 'last_name')].filter(id => id.value != answers.mgr);
          return mgrs;
        },
      }
    ],
    delDept: [
      {
      name: "dept",
      type: "list",
      message: "Which department would you like to delete? All employees and roles in this department will also be deleted.",
      choices: await server.getNameAndId('departments','id','name'),
    },
    // {
    //   name: "emps",
    //   type: "checkbox",
    //   message: "Which employees from this department would you like to delete",
    //   choices: async answers => {
    //     let delEmp = await server.getNameAndIdWhere(`employees`,`departments`,answers.dept,`first_name`,`last_name`);
    //     return delEmp;
    //   },
    //   when: async answers => {
    //     let delEmp = await server.getNameAndIdWhere(`employees`,`departments`,answers.dept,`first_name`,`last_name`);
    //     return delEmp.length;
    //   }
    // },
  ],
    delRole: {
      name: "rolesToBeDel",
      type: "checkbox",
      message: "Which role(s) would you like to delete?",
      choices: await server.getNameAndId('roles','id','name'),
    },
    delEmps: [
      {
        name: "empToBeDel",
        type: "list",
        message: "Which employee would you like to delete? This employee's subordinates will no longer have a manager.",
        choices: await server.getNameAndId('employees','id','first_name','last_name'),
        when: answers => !answers.empToBeDel,
      },
      // {
      //   name: "workers",
      //   type: "checkbox",
      //   message: "Which of this employees subordinates would you like to delete?",
      //   choices: async answers => {
      //     let options = await server.getNameAndId(`employees WHERE manager_id = ${answers.empToBeDel}`,'id','first_name','last_name');
      //     return options;
      //   },
      //   when: async answers => {
      //     let options = await server.getNameAndId(`employees WHERE manager_id = ${answers.empToBeDel}`,'id','first_name','last_name');
      //     return options.length;
      //   }
      // },
    ],
  };
  return questions;
}

module.exports = getQuestions;