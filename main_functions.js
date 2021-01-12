const inquirer = require("inquirer");
const server = require("./mysql-server");



const getMain = async () => {

  let getQuestions = await require("./questions")();
  let questions =  getQuestions;

  const main = {

    async addDept (print = true) {
      let dept = await inquirer.prompt(questions.addDept);
      // needs to add dept before moving on (e.g. needs depts to add role)
      let deptId = await server.addToTable("departments", ["name", dept.deptName])
      if (print) {
        console.log(`This is the new list of departments:`)
        await server.print("departments", "id", "name");
      }
      return deptId;
  },

    async addRole (print = false) {
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
    },

    async addEmployee (print = true) {
      let { name, dept, role, boss } = await inquirer.prompt(questions.addAndAssign);
      switch(dept) {
        case 'other':
          dept = await addDept(false);
          break;
        case 'go back to start':
          return;
      };
      switch(role) {
        case 'other':
          role = await addRole(false);
          break;
        case 'go back to start':
          return;
      };
      switch(boss) {
        case 'other':
          boss = await addEmployee(false);
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
    },

    async delEmployee (...ids) {
      console.log(`The following employees have been deleted from the database`);
      server.print(`employees WHERE id IN (${ids.join()})`,`first_name`, `last_name`)
      ids.map(id => {
        server.delFromTable("employees", "id", id)
      });
    },

    async printDept () {
      let vdept = await inquirer.prompt(questions.viewDept);
      server.print(`employees JOIN roles ON employees.role_id = roles.id JOIN departments ON departments.id = roles.department_id WHERE departments.id = ${vdept.deptToView}`,'first_name','last_name','name AS department','title','salary')
    },

    async printRole () {
      let vrole = await inquirer.prompt(questions.viewRole);
      server.print(`roles JOIN departments ON roles.department_id = departments.id WHERE roles.id = ${vrole.roleToView}`,'title','salary','name AS department')
    },

    async printEmployees () {
      let vemp = await inquirer.prompt(questions.viewEmployee);
      server.print(`employees JOIN roles ON employees.role_id = roles.id LEFT JOIN employees AS manager ON employees.manager_id = manager.id WHERE employees.id = ${vemp.empToView}`, "employees.id", "employees.first_name", "employees.last_name","title","manager.first_name AS mgr_first_name","manager.last_name AS mgr_last_name","salary");
    },

    async updateEmpRole (specific = '') {
      let pemp;
      if (specific) {
        pemp = specific;
      } else {
        pemp = await inquirer.prompt(questions.updateRole)[0];
      }
      let { pdept, prole } = await inquirer.prompt(questions.updateRole).slice(1);
      // server.update('employees','role_id',`employees.${pemp}.role_id`,prole);
      server.update(`employees`,`role_id`,pemp,prole)
    },

    async updateManager () {
      let { mgr, emps } = await inquirer.prompt(questions.updateManager);
      emps.map(emp => server.update(`employees`,`manager_id`,emp,mgr))
    },

    async delDept () {
      let { dept, emps } = await inquirer.prompt(questions.delDept);
      console.log(emps);
      await delEmployee(emps);
      let savedEmps = await server.getNameAndId(`employees JOIN roles ON employees.role_id = roles.id JOIN departments.id = roles.departments_id WHERE department_id = ${dept}`,'id','first_name','last_name');
      savedEmps.map(async emp => await updateEmpRole(emp));
      delFromTable('departments','id','dept');
    },
  };
return main;
}

module.exports = getMain;