const inquirer = require("inquirer");
const { sum } = require("./mysql-server");
const server = require("./mysql-server").server;

const getMain = async () => {

  let getQuestions = require("./questions");
  let questions =  await getQuestions();

  const main = {

    async addDept (print = true) {
      let dept = await inquirer.prompt(questions.addDept);
      if (dept === 'go back to start') return;
      // needs to add dept before moving on (e.g. needs depts to add role)
      let deptId = await server.addToTable("departments", ["name", dept.deptName])
      if (print) {
        console.log(`This is the new list of departments:`)
        await server.print("departments", "id", "name");
      }
      return deptId;
  },

    async addRole (print = false, specific = '') {
      let dept;
      let {role, salary} = await inquirer.prompt(questions.addRole.slice(0,2));
      if (specific) dept = specific;
      else {
        dept = await inquirer.prompt(questions.addRole[2]);
        dept = dept.dept;
      }
      switch(dept) {
        case 'other':
          dept = await main.addDept(false)
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

    async addEmployee (print = true, specDept = '', specRole = '') {
      let { name, dept, role, boss } = await inquirer.prompt(questions.addAndAssign);
      if (specDept) dept = specDept; 
      if (specRole) role = specRole;
      switch(dept) {
        case 'go back to start':
          return;
        case 'other':
          dept = await this.addDept(false);
          role = 'other';
          break;
      };
      switch(role) {
        case 'go back to start':
          return;
        case 'other':
          role = await this.addRole(false, dept);
          waitForBoss = await inquirer.prompt(questions.addAndAssign[3]);
          boss = waitForBoss.boss;
          break;
      };
      switch(boss) {
        case 'go back to start':
          return;
        case 'other':
          console.log(`Adding info for ${name}'s manager.`)
          boss = await this.addEmployee(false);
          break;
      }
      // }
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

    async delEmployee (specEmp = '', print = true) {
      let empToBeDel;
      if (specEmp) empToBeDel = specEmp;
      else {
        let e = await inquirer.prompt(questions.delEmps);
        empToBeDel = e.empToBeDel;
      }
      if (print) {
      console.log(`The following employee will be deleted from the database`);
      }
      await server.print(`employees WHERE id = ${empToBeDel}`,`first_name`, `last_name`)
      let workers = await server.getNameAndId(`employees WHERE manager_id = ${empToBeDel}`,'id','first_name','last_name')
      workers.map(worker => server.update("employees","manager_id",worker.value, null));
      await server.delFromTable("employees","id",empToBeDel)
    },

    async delEmployees (...ids) {
      if (!ids.length) return;
      console.log(`The following employees will be deleted from the database`);
      server.print(`employees WHERE id IN (${ids.join()})`,`first_name`, `last_name`)
      ids.reverse();
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
      if (specific) pemp = specific;
      else {
        let e = await inquirer.prompt(questions.updateRole[0]);
        pemp = e.pemp;
      }
      let { pdept, prole } = await inquirer.prompt(questions.updateRole.slice(1));
      await server.update(`employees`,`role_id`,pemp,prole)
      console.log('The employees role has been updated.')
    },

    async updateManager () {
      let { emps, mgr } = await inquirer.prompt(questions.updateManager);
      emps.map(emp => server.update(`employees`,`manager_id`,emp,mgr))
      console.log('The employees manager has been updated.')

    },

    async delDept () {
      let { dept } = await inquirer.prompt(questions.delDept);
      let emps = await server.getNameAndIdWhere(`employees`,`departments`,dept,`first_name`,`last_name`);
      // ******* will eventuall relocate saved employee, below did not work :( *********
      // for now just deletes all employees in the dept
      // let savedEmps = await server.getNameAndIdWhere(`employees`,`departments`,dept,`first_name`,`last_name`);
      // await savedEmps.map(async emp => await this.updateEmpRole(emp));
      if (emps.length) await emps.map(emp => this.delEmployee(emp.value, false));
      let rolesToDel = await server.getNameAndIdWhere('roles','departments',dept,'title')
      rolesToDel.map(async role => {
        await server.delFromTable('roles','department_id',role.value); 
      })
      server.delFromTable('departments','id',dept);
      console.log('The department has been deleted.')
    },

    async viewBudget () {
      let { dept } = await inquirer.prompt(questions.viewBudget);
      server.sum(dept);
    }
  };
return main;
}

module.exports = getMain;