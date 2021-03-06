//2.NOW WE WANT TO WRITE SocialNetwork.sol and test it here, with 2 libraries mochajs.org and chaijs.com
const SocialNetwork = artifacts.require('./SocialNetwork.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should() 
                          //antes era accounts solo, ya q las cuentas venian de ganashe, pero vamos a especificar y ponerles nombre 
contract('SocialNetwork', ([deployer, author, tipper]) => {
  let socialNetwork  

  before(async () => {
    socialNetwork = await SocialNetwork.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
  //2.1.How do we check that it was deployed succesfully. Remember, inside the console we return the address
      //In order to use the await we have to use an async.
      //now lets check for the address
      const address = await socialNetwork.address
      //now we wanna make sure that the addres is not ``blank´´
      assert.notEqual(address, 0x0)
      //and Imma check its not an empty string, its not null, its not undefined
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    }) //Once done so, we test. -> test/SocialNetwork.js -> truffle test -> Deploys successfully
//2.2 LETS DO ANOTHER TESTS. 
    it('has a name', async () => {
      const name = await socialNetwork.name()
      assert.equal(name, 'Dapp University Social Network')//But we have one problem, we don´t have an instance of Social network yet
      //So imma remove socialNetwork = await SocialNetwork.deployed() inside describe('deplo.... cuz I don´t wanna have to do this every time like 
      //for example now that I´D have to cropy it inside this it('has a name.....
      //Para q no sea tedioso para proximos tests ponemos un before y dentro lo q queremos q aparezca dentro de los siguientes tests. Asi evitamos duplicados(modo senior)
    })//Ok once runned, we say that it passed the test.                  GO TO 3.0 IN SocialNetwork.sol
  })
//_______________________________________________________________________________________________________________________________________________________________________________________________
  describe('posts', async () => {
    let result, postCount
    before(async () => {
//3.2.2 It will also correspond to the msg.sender which is gonna get saved as the author value inside of the post mapping. 
//Y ojo en order to access result on down the line we´ll create a LET RESULT up
//3.2.6 this result is gonna contain the info for the event itself that will allow us to verify the data from the post, u can go down below
      result = await socialNetwork.createPost('This is my first post', { from: author })
      postCount = await socialNetwork.postCount()
    })
    it('creates posts', async () => {
      // SUCESS
//3.2.4 
// So events, that get triggered whenever we call´em     GO TO 3.2.5 IN .SOL event
      assert.equal(postCount, 1)
//3.2.6 The logs is gonna contain the event'PostCreated'(u can see this in truffle)
// the logs is an array. Ahora si lo testeamos con truffle test nos dirá los valroes inside the event
// como el ID, el content, the tip ammount, and the author. Y podemos ver q esta todo correct
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(event.content, 'This is my first post', 'content is correct')
      assert.equal(event.tipAmount, '0', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')
      // FAILURE: Post must have content
//3.2.7.PONEMOS FAILURE PARA Q SE SEPA Q SI HACE ESO SERÁ RECHAZADO, como ves ponemos q si tiene contenido en blanco será rechazado
//de primeras no fallará, pero x eso queremos crear un test donde falle asi que ve a .sol para continuar con la segunda parte
//3.3.4.
      await socialNetwork.createPost('', { from: author }).should.be.rejected;
    })
//////////////////////3.3 .The author has to pay more gas fee than the deployer, we can see that we have less eth in acc 0 and 1
    //but we have to creation the tip function and its going to go down
    it('lists posts', async () => {
      const post = await socialNetwork.posts(postCount)
//3.3.1.Once created const post we can inspect the values doing the same as we did. Now u can continue with 3.3.2 in.sol
      assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(post.content, 'This is my first post', 'content is correct')
      assert.equal(post.tipAmount, '0', 'tip amount is correct')
      assert.equal(post.author, author, 'author is correct')
    })
///////////////////////3.4
    it('allows users to tip posts', async () => {
      // Track the author balance before purchase
      let oldAuthorBalance
      //Thats how u chenck de balance
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)
//3.3.5. Creo q es 3.4 ya pero bueno luego arreglo el desorden, lo de value es para no poner lo de wei y que así no tengamos q poner a cada rato muchos 0s-
//PARA 3.3.6 VETE A SUCCES DE ABAJO
      result = await socialNetwork.tipPost(postCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

      // SUCESS
//3.3.6. Copiamos lo de arriba y sustituimos valores, y testeamos uno a uno. asi como lo demsa
//en lets, success, failure... y ya es testear a partir de min 1:25:00 aprox, y ya esta solo era la ultimaparte
//ponemos en node -> truffle migrate --reset -> y se crea una copia del SC y se pone a la blockchain
      //BUENO YA ACABO PENDEJOS , AHORA VAMOS CON EL FRONT END. 4.0 en appjs
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(event.content, 'This is my first post', 'content is correct')
      assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      // Check that author received funds. Thats how u chenck de balance
      let newAuthorBalance
      
      newAuthorBalance = await web3.eth.getBalance(author)
      
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let tipAmount
      tipAmount = web3.utils.toWei('1', 'Ether')
      tipAmount = new web3.utils.BN(tipAmount)

      const exepectedBalance = oldAuthorBalance.add(tipAmount)

      assert.equal(newAuthorBalance.toString(), exepectedBalance.toString())

      // FAILURE: Tries to tip a post that does not exist
      await socialNetwork.tipPost(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
    })

  })
})
