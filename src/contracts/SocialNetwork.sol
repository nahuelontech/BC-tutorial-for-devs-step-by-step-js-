pragma solidity ^0.5.0;
contract SocialNetwork {
    string public name;  
//3.2.1. We don´t wanna hardcode the  postcreated(sin lo de abajo se quedaba un código feo)
//This will keep track of the number of posts that gets added to the mapping below.
    uint public postCount = 0;
//3.2 The uint is going to be the id of the post and the value is going to be the post struct
    mapping(uint => Post) public posts; 
//3.2. Once we have this we hve to create a new post inside of the function. And also we need the mapping.
    struct Post {
        uint id;
        string content;
        uint tipAmount;
        address payable author;
    }
//3.2.5 .We are creating this event to track the values that were stored inside of the post
    event PostCreated(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    event PostTipped(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    constructor() public { //1.1
        name = "Dapp University Social Network";
    }
//3.2. We gotta create a function that allows users to create posts
    function createPost(string memory _content) public {
//3.2.7.this just takes the content which is a string and converts it into a bytes array. 
//Si fuese falso no continuaría con lo q tiene debajo
        require(bytes(_content).length > 0);
        // Increment the post count, if u see up we can see that we are incrementing the value 3.2.1
        postCount ++;
        // Create the post. As u see after created the mapping and the struct we can put posts =
        //and use that value with the array 3.2.1. This creates the post and add it to the mapping
        //GO TO 3.2.2 IF IN .JS
        posts[postCount] = Post(postCount, _content, 0, msg.sender);
//3.2.5.We are creating this event to track the values that were stored inside of the post. run the test with truffle test
//Para 3.2.6 ve a test
        emit PostCreated(postCount, _content, 0, msg.sender);
    }
//3.3.2. tenemos q poner payable para q acepte ether
    function tipPost(uint _id) public payable {
        // Make sure the id is valid 
        require(_id > 0 && _id <= postCount);
        // Fetch the post 3.3.2. FIRST WE R GONNA FETCH THE POST FROM THE BC, SO WE CAN FETCH IT OUT OF THE MAPPING FROM UPSIDE
        // THIS WILL CREATE A NEW COPY OF IT AND WE WILL UPDATE THESE VALUES(POST _POST..) AND THAT WON´T AFFECT THE POST ON THE BC
        //IT WON´T AFFECT IT UNTIL WE REASSIGN POSTS[_ID]  GO TO 3.3.3 NO
        Post memory _post = posts[_id];
        // Fetch the author. Ojo tmb tenemos q decir q la address es pagable , asi q tmbien ve a struct y events y pon payable address
        address payable _author = _post.author;
        // Pay the author by sending them Ether.     
        address(_author).transfer(msg.value);
        // Incremet the tip amount 3.3.4. (WE NEED TO ADD THE ACTUAL TIP THATS COMMING IN. BUT HOW DO WE DO THAT?
        //ES DIFICIL XQ LO Q TENEMOS ES UN ARG en function(uint _id), solo tenemos el ID del post q queremos pass in. So wheres the actuall tip?
        //wheres the crypto itself?we´re tipping this post with ether but how do u tell this function that u want to tip ETHER, theres no argument for the
        //amount. Solidity nos deja usar mas function metadata just like msg.sender de arriba to track the amount of ether they get sent in whenerver this functions is called
        //ahora tenemos que poner from : author en el test (en should be rejected.).            PARA 3.3.5 crea un event llamado PostTipped y dsps vete a test  a it(`allows users to tip post´... 
        _post.tipAmount = _post.tipAmount + msg.value;
        // Update the post 3.3.3. WE´LL UPDATE THE POST NOW BEFORE I MANIPULATE IT. SE UPDATEA DESPUES DE HAVER ECHO LO DE AUTOR,TIP AMOUNT...
        posts[_id] = _post;
        // Trigger an event
        emit PostTipped(postCount, _post.content, _post.tipAmount, _author);
    }
}
