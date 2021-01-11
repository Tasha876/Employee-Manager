const server = require("./mysql-server");

const inquirer = require("inquirer");
const { delTable, delFromTable, update } = require("./mysql-server");

const getMain = async () => {

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
        name: "salary",
        type: "number",
        message: "What salary will this role get?",
      },
      {
        name: "dept",
        type: "list",
        message: "Which dept does this role belong to?",
        choices: [...await server.getNameAndId('departments','id','name'), 'other', 'go back to start']
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
        } 
      },
      {
        name: "dept",
        type: "list",
        message: "Which department would you like to assign to this employee?",
        choices: [...await server.getNameAndId('departments','id','name'), 'other', 'go back to start'],
      },
      {
        name: "role",
        type: "list",
        message: "Which role would you like to assign to this employee?",
        choices: async answers => {
          let table = `roles  where roles.department_id = ${answers.dept}`;
          return [...await server.getNameAndId(table, 'id', 'title'), 'other', 'go back to start'];
        }
      },
      {
        name: "boss",
        type: "list",
        message: "Which manager would you like to assign to this employee?",
        choices: [...await server.getNameAndId('employees','id','first_name',"last_name"), {value: "", name: 'has no manager'}, 'other', 'go back to start'],
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
      name: "budget",
      type: "list",
      message: "Which department's budget would you like to view?",
      choices: []
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
        choices: await server.getNameAndId('employees','id','first_name', 'last_name'),
      },
      {
        name: "emps",
        type: "checkbox",
        message: "Which employee(s) would you like to assign to this manager?",
        choices: async answers => {
          console.log(answers.mgr);
          let mgrs = [...await server.getNameAndId('employees','id','first_name', 'last_name')].filter(id => id.value != answers.mgr);
          console.log(mgrs);
          return mgrs;
        }
      }
    ],
    delDept: [
      {
      name: "dept",
      type: "list",
      message: "Which department would you like to delete?",
      choices: await server.getNameAndId('departments','id','name'),
    },
    {
      name: "emps",
      type: "checkbox",
      message: "Which employees from this department would you like to delete",
      choices: async answers => {
        let delEmps = await server.getNameAndId(`employees JOIN roles ON employees.role_id = roles.id JOIN departments ON departments.id = roles.department_id WHERE departments.id = ${answers.dept}`,'id','first_name','last_name');
        return delEmps;
      }
    },
  ],
    delRole: {
      name: "rolesToBeDel",
      type: "checkbox",
      message: "Which role(s) would you like to delete?",
      choices: await server.getNameAndId('roles','id','name'),
    },
    delEmps: {
      name: "empsToBeDel",
      type: "checkbox",
      message: "Which employees would you like to delete?",
      choices: await server.getNameAndId('employees','id','first_name','last_name')
    }
  }

  const addDept = async (print = true) => {
    let dept = await inquirer.prompt(questions.addDept);
    // needs to add dept before moving on (e.g. needs depts to add role)
    let deptId = await server.addToTable("departments", ["name", dept.deptName])
    if (print) {
      console.log(`This is the new list of departments:`)
      await server.print("departments", "id", "name");
    }
    console.log(dept)
    return deptId;
  }

  const addRole = async (print = false) => {
    let {role, salary, dept} = await inquirer.prompt(questions.addRole);
    switch(dept) {
      case 'other':
        dept = await addDept(false)
        break;
      case 'go back to start':
        return;
    }
    // await addRole(role.role, role.salary, role.dept);
    let roleId = await server.addToTable("roles", ["title", role],["salary", salary], ["department_id", dept]);
    if (print) {
      console.log(`This is the new list of roles:`);
      await server.print("roles join departments on roles.department_id = departments.id", "roles.title","departments.name as department","roles.salary");
    }
    return roleId;
  }

  const addEmployee = async (print = true) => {
    let { name, role, boss } = await inquirer.prompt(questions.addAndAssign);
    switch(role) {
      case 'other':
        role = await addRole(false)
        break;
      case 'go back to start':
        return;
    };
    switch(boss) {
      case 'other':
        boss = await addEmployee(false)
        break;
      case 'go back to start':
        return;
    }
    let first; let last;
    if (!name) return '';
    else if (name.split(",").length == 2)  {
      first = name.split(",")[1].trim();
      last = name.split(",")[0].trim();
    } else if (name.split(" ").length == 2)  {
      first = name.split(" ")[0].trim();
      last = name.split(" ")[1].trim();
    }
    let empId = server.addToTable("employees", ["first_name", first],["last_name", last], ["role_id", role],["manager_id", boss])
    if (print) {
      console.log(`This is the new list of employees:`)
      server.print("employees JOIN roles ON employees.role_id = roles.id", "employees.id", "first_name", "last_name","title");
    }
    return empId;
  }

  const delEmployee = async (...ids) => {
    console.log(`The following employees have been deleted from the database`);
    server.print(`employees WHERE id IN (${ids.join()})`,`first_name`, `last_name`)
    ids.map(id => {
      server.delFromTable("employees", "id", id)
    });
  }

  const printDept = async () => {
    const vdept = await inquirer.prompt(questions.viewDept);
    server.print(`employees JOIN roles ON employees.role_id = roles.id JOIN departments ON departments.id = roles.department_id WHERE departments.id = ${vdept.deptToView}`,'first_name','last_name','name AS department','title','salary')
  }

  const printRole = async () => {
    const vrole = await inquirer.prompt(questions.viewRole);
    server.print(`roles JOIN departments ON roles.department_id = departments.id WHERE roles.id = ${vrole.roleToView}`,'title','salary','name AS department')
  }

  const printEmployees = async () => {
    const vemp = await inquirer.prompt(questions.viewEmployee);
    server.print(`employees JOIN roles ON employees.role_id = roles.id LEFT JOIN employees AS manager ON employees.manager_id = manager.id WHERE employees.id = ${vemp.empToView}`, "employees.id", "employees.first_name", "employees.last_name","title","manager.first_name AS mgr_first_name","manager.last_name AS mgr_last_name","salary");
  }

  const updateEmpRole = async (specific = '') => {
    let pemp;
    if (specific) {
      pemp = specific;
    } else {
      pemp = await inquirer.prompt(questions.updateRole)[0];
    }
    let { pdept, prole } = await inquirer.prompt(questions.updateRole).slice(1);
    // server.update('employees','role_id',`employees.${pemp}.role_id`,prole);
    server.update(`employees`,'role_id',pemp,prole)
  }

  const updateManager = async () => {
    const { mgr, emps } = await inquirer.prompt(questions.updateManager);
    emps.map(emp => server.update(`employees`,'manager_id',emp,mgr))
  }

  const delDept = async () => {
    const { dept, emps } = await inquirer.prompt(questions.delDept);
    console.log(emps);
    await delEmployee(emps);
    let savedEmps = await server.getNameAndId(`employees JOIN roles ON employees.role_id = roles.id JOIN departments.id = roles.departments_id WHERE department_id = ${dept}`,'id','first_name','last_name');
    savedEmps.map(async emp => await updateEmpRole(emp));
    delFromTable('departments','id','dept');
  }


  // async addDept (ret = false)  {
  //   let dept = await inquirer.prompt(questions.addDept);
  //   // needs to add dept before moving on (e.g. needs depts to add role)
  //   await server.addToTable("departments", ["name", dept.deptName])
  //   console.log(`This is the new list of departments:`)
  //   await server.print("departments", "id", "name");
  //   if (ret) return server.getNameAndId('departments','id','name');
  // },
  // async addRole () {
  //   const {role, salary, dept} = await inquirer.prompt(questions.addRole);
  //   // await addRole(role.role, role.salary, role.dept);
  //   await server.addToTable("roles", ["title", role],["salary", salary], ["department_id", dept])
  //     console.log(`This is the new list of roles:`)
  //   await server.print("roles join departments on roles.department_id = departments.id", "roles.title","departments.name as department","roles.salary");
  // },

  // async addEmployee (empName, role_id, mgr_id)  {
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
  // },

  // async delEmployee (...ids)  {
  //   console.log(`The following employees have been deleted from the database`);
  //   server.print(`employees WHERE id IN (${ids.join()})`,`first_name`, `last_name`)
  //   ids.map(id => {
  //     server.delFromTable("employees", "id", id)
  //   });
  // },

  // async printDept ()  {
  //   const vdept = await inquirer.prompt(questions.viewDept);
  //   server.print(`employees JOIN roles ON employees.role_id = roles.id JOIN departments ON departments.id = roles.department_id WHERE departments.id = ${vdept.deptToView}`,'first_name','last_name','name AS department','title','salary')
  // },

  // async printRole ()  {
  //   const vrole = await inquirer.prompt(questions.viewRole);
  //   server.print('roles JOIN departments ON roles.department_id = departments.id','title','salary','name')
  // },

  // async printEmployees () {
  //   const vEmp = await inquirer.prompt(questions.viewEmployee);
  //   server.print("employees JOIN roles ON employees.role_id = roles.id", "employees.id", "first_name", "last_name","title");
  // }

  const main = {
    addRole,
    addDept,
    addEmployee,
    printRole,
    printEmployees,
    printDept,
    delEmployee,
    updateEmpRole,
    updateManager,
    delDept,
  };
  return { questions: questions, main: main };
}

module.exports = {
  getMain,
}