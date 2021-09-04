import React, { Component } from 'react';
//3.4. LO PRIMERO Q HACEMOS ES IMPORTAR WEB3
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import SocialNetwork from '../abis/SocialNetwork.json'
import Navbar from './Navbar'
import Main from './Main'

class App extends Component {
//3.4.2. What this says is like whenever this component is gonna mount to the virtual DOM inside of react, 
  //wa wanna call the functions inside of it..Si vamos a la página y echamos un vistazo a consola veremos q todo piola
  //Entonce ahora tenemos web3 connected to our app, and our app is now a BC app. SO let´s try to fetch some data from the BC
  //Lo primero q qeremos hacer es fetch the account from metamask. ves a 3.4.3
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }
//3.4.1. Inside of it i wanna write all the code that takes the connection from metamask
  //and wires it up to our web3 and reads it inside of this web3 connection inside of our app
  //metamask nos da una plantilla para eso(metamas breaking change injecting web3...)
  //y lo pegamos debajo de loadWeb3. We´ve defined this function but wa wanna call it whenever the component(in class app extends)is loaded
  //para 3.4.2 ves a componentwillmount arriba
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }
//3.4.3.Recuerda poner en willmount q carge esta función. Vale ahora puedes importar las wallets de ganashe a metamask y cambie nombres
//En console de la web nos saldra la cuenta, ahora queremos list the accoount out on the page so we can see which account were signed in
  //whenever u use the app; lo q haré será store the address after we fetch it from web3, so imma usea a reacts state object PARA ESO GO TO 3.4.4.
  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
//3.4.5. So we can store the value like this. After we´ve fetched it with web3 we´ll just assign it to the state
//so react has a especial function for that(below). Now that we have done that, we have acces to the account 0 with the state object 
//anywhere inside this component and we can also pass it down to other components; IMMA SHOW U HOW TO DO THAT
//FOR 3.4.6 GO DOWN BELOW
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = SocialNetwork.networks[networkId]
    if(networkData) {
      const socialNetwork = web3.eth.Contract(SocialNetwork.abi, networkData.address)
      this.setState({ socialNetwork })
      const postCount = await socialNetwork.methods.postCount().call()
      this.setState({ postCount })
      // Load Posts
      for (var i = 1; i <= postCount; i++) {
        const post = await socialNetwork.methods.posts(i).call()
        this.setState({
          posts: [...this.state.posts, post]
        })
      }
      // Sort posts. Show highest tipped posts first
      this.setState({
        posts: this.state.posts.sort((a,b) => b.tipAmount - a.tipAmount )
      })
      this.setState({ loading: false})
    } else {
      window.alert('SocialNetwork contract not deployed to detected network.')
    }
  }

  createPost(content) {
    this.setState({ loading: true })
    this.state.socialNetwork.methods.createPost(content).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  tipPost(id, tipAmount) {
    this.setState({ loading: true })
    this.state.socialNetwork.methods.tipPost(id).send({ from: this.state.account, value: tipAmount })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }
//3.4.4.So we can define a state inside of our component like this...(this is what reacts tells us to do)
// we can store the account like this, go to 3.4.5. in  this.setstate
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      socialNetwork: null,
      postCount: 0,
      posts: [],
      loading: true
    }

    this.createPost = this.createPost.bind(this)
    this.tipPost = this.tipPost.bind(this)
  }
//3.4.6. WE R GONNA CREATE A NEW SECTION FOR THE ADDRESS , SO INSIDE THE NAV BAR, min 1:48 es complicado ya q lo ha cambiado.Pero ponia la cuenta abajo
//y luego puso toda esa info en navbar.js y ahi pone html y javascript. Obvio pon import navbar arriba. 
//en fin hace muchos lios ene l front end a partir del 1:48. Voy a dejarlo AKI HASTA Q SEA ESTRICTAMENTE NECESARIO
  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              posts={this.state.posts}
              createPost={this.createPost}
              tipPost={this.tipPost}
            />
        }
      </div>
    );
  }
}

export default App;
