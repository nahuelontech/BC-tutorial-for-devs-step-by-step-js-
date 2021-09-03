//So, this is gonna create a new file that its gonna get run whenever we put a new SC on the BC
//Truffle uses something called artifacts to get this value ``SocialNetwork´´, and the artifacts come from the files
//inside the abis directory(src), in this case from socialnetwork.json. Dentro podemos ver el artifacts that truffle
//uses to do this migration. Read the other migration
//1.2 Now created the migration go to SocialNetwork.sol and put it on the ganashe personal BC -> TRUFFLE MIGRATE
//OK ONCE DONE SO, ITS TIME TO INTERACT WITH THE BC WE PUT -> TRUFFLE CONSOLE   , so now we can interact with the SC deployed on the network.
//I WILL FETCH THIS SC FROM THE BC
//1.3. For example we can:   SocialNetwork.deployed()           and gets a deployed copy
//But theres a problem, all this calls to the BC are asincronizados. Una de las maneras de handle this is:
// SocialNetwork-deployed().then((c) => { contract = c })  -> it will give `` undefined´´
//after we write ´´contract´´. Esa es una de las maneras
//Otra manera es contract = await SocialNetwork.deployed()    y después pon contract. We will do this pattern repeatily whenever we develop this SC on the client side and also in the test.
//1.4. Once done so, we can inspect the addres on the blockchain  with contract.address
//we can also run other code from thte SC like name = await contract.name() -> undefined -> write ´´name´´ and it´ll give -> 'Dapp University Social Network'
const SocialNetwork = artifacts.require("SocialNetwork");

module.exports = function(deployer) {
  deployer.deploy(SocialNetwork);
};
// NOW LETS CONTINUE WITH 2.0 CREATE POSTS IN socialnetwork.js(javascript from tests only) y.sol.
