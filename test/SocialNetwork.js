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
//3.1. HERE WE WILL TEST 3 EXAMPLES THAT DESCRIBE THE BEHAVIOUR
  describe('posts', async () => {
    let result, postCount

    before(async () => {
//3.2.2.This is how u call a function in .sol. But we need to especify who the author is.
//We write the addres from author calling it. It will also correspond to the msg.sender which is gonna
//get saved as the author value inside of the post mapping. Bien ahora lets call that, by saying await and result
//Y ojo en order to access result on down the line we´ll create a LET RESULT up
//3.2.6 this result is gonna contain the info for the event itself that will allow us to verify the data from the post, u can go down below
      result = await socialNetwork.createPost('This is my first post', { from: author })
//3.2.3 Ahora me quiero asegurar q el post ha sido creado.
//Vale en resumen estas son las dos condiciones que vamos a check whenever it creates a post
//PERO COMO LO CHECKEAMOS? GO TO 3.2.4
      postCount = await socialNetwork.postCount()
    })
//3.2. Look also at .sol
    it('creates posts', async () => {
      // SUCESS
//3.2.4 Vale , las dos condiciones de arriba antes estaban dentro de it, pero para checkear el postcount
//ponemos esta(es como antes q lo puso arriba pa no repetir), una vez puesta la linea de codigo de abajo
//nos vamos a truffle y ponemos truffle test y vemos que it passes
//So Now WE want to dig into the post and ensure that the values are set correctly; so we need to write some more coide
//in order to do this. So events, that get triggered whenever we call´em     GO TO 3.2.5 IN .SOL event
      assert.equal(postCount, 1)
//3.2.6 The logs is gonna contain the event'PostCreated'(u can see this in truffle)
// the logs is an array. Ahora si lo testeamos con truffle test nos dirá los valroes inside the event
// como el ID, el content, the tip ammount, and the author. Y podemos ver q esta todo correct
//DESPUÉS YA PODEMOS PONER LOS OTROS VALORES COMO LOS 4 asserts DE ABAJO
//LO SIGUIENTE Q HAREMOS SERÁ AÑADIR BEHAVIOUR TO THE FUNCTION CREATEPOST FROM SOL, WE WANNA ENSURE THAT THE POST ACTUALLY HAS
//SOME CONTENT INSIDE OF IT, O sea no queremos q nadie spamee posts en blanco VES A 3.2.7
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(event.content, 'This is my first post', 'content is correct')
      assert.equal(event.tipAmount, '0', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')
      // FAILURE: Post must have content
//3.2.7.PONEMOS FAILURE PARA Q SE SEPA Q SI HACE ESO SERÁ RECHAZADO, como ves ponemos q si tiene contenido en blanco será rechazado
//de primeras no fallará, pero x eso queremos crear un test donde falle asi que ve a .sol para continuar con la segunda parte
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
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

      result = await socialNetwork.tipPost(postCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

      // SUCESS
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(event.content, 'This is my first post', 'content is correct')
      assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      // Check that author received funds
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
