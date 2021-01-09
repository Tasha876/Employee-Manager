const inquirer = require("inquirer");
const mysql = require("mysql");
const server = require("./mysql-server");

const cTable = require('console.table');

const addDept = async (name) => {
  server.addToTable("departments", ["name", name])
  console.log(`This is the new list of departments:`)
  server.print("departments", "id", "name");
}

const addRole = async (title, salary, dept) => {
  server.addToTable("roles", ["title", title],["salary", salary], ["department_id", dept])
    console.log(`This is the new list of roles:`)
  server.print("roles join departments on roles.department_id = departments.id", "roles.title","departments.name as department","roles.salary");
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
  server.addToTable("employees", ["first_name", first],["last_name", last], ["role_id", role_id],["manager_id", mgr_id])
  console.log(`This is the new list of employees:`)
  server.print("employees JOIN roles ON employees.role_id = roles.id", "employees.id", "first_name", "last_name","title");
}

const delEmployee = async (...ids) => {
  // because I can't figure out how to get the name from inquirer in the response :/
  // connection.query(`SELECT first_name, last_name FROM employees WHERE id IN (${ids.join()})`, (err, res) => {
  //   if (err) throw err;
  //   names = res.map(name => name.first_name + ' ' + name.last_name);
  //   console.log(`Deleting ${names} from the database`)
  // }); 
  console.log(`The following employees have been deleted from the database`);
  server.print(`employees WHERE id IN (${ids.join()})`,`first_name`, `last_name`)
  let names = ids.map(id => {
    server.delFromTable("employees", "id", id)
  });
}
  // let deletedEmps = ids.map(id => id.name).join(", ")
  // console.log('The employees', deletedEmps, 'have been removed from the system')


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
        choices: [... await server.getNameAndId('departments','id','name'), 'other', 'go back to start'],
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
        choices: [... await server.getNameAndId('departments','id','name'), 'other', 'go back to start'],
      },
      {
        name: "role",
        type: "list",
        message: "Which role would you like to assign to this employee?",
        choices: async answers => {
          let table = `roles  where roles.department_id = ${answers.dept}`;
          return [... await server.getNameAndId(table, 'id', 'title'), 'other', 'go back to start'];
        },
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
      name: "EmpToView",
      type: "list",
      message: "Which employee's information would you like to see?",
      choices: await server.getNameAndId('employees','id','first_name', 'last_name'),
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
              await addDept(dept.deptName);
              break;
          case "Add role.":
            const role = await inquirer.prompt(questions.addRole);
            await addRole(role.role, role.salary, role.dept);
            break;
          case "Add employee.":
            const emp = await inquirer.prompt(questions.addAndAssign);
            await addEmployee(emp.name, emp.role, 1);
            break;
          case "View departments.":
            const vdept = await inquirer.prompt(questions.viewDept);
            break;
          case "View roles.":
            const vrole = await inquirer.prompt(questions.viewRole);
            break;
          case "View employees.":
            const vemp = await inquirer.prompt(questions.viewEmployee);
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
            await delEmployee(...delEmps.empsToBeDel);
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

run();

// module.exports = run;