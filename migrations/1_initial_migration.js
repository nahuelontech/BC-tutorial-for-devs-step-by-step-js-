//If u´ve ever used another development framework, like for build mobile app or any kinda app that uses a database
//seguramente hayas visto un migration file. A migrations means that u are moving something from one state to another 
//In this case we are moving our SC to the blockchain, also means that we are updating the blockchain state to another
const Migrations = artifacts.require("Migrations");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
