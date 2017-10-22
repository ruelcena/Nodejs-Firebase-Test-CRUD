module.exports = function (app) {  

var parseurl = require('parseurl');
var session = require('express-session');

//Init firebase
var FirebasePaginator = require("firebase-paginator");
var firebaseAdmin = require("firebase-admin");
var serviceAccount = require("../fireapp-1fdec.json");

var firebaseDb = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: "https://fireapp-1fdec.firebaseio.com"
});

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

//Route - make default index.html
app.get('/', function(req,res){
  res.render( __dirname + '/views/pages/index');
}); 

app.get('/about', function(req,res){    
  res.render( __dirname + '/views/pages/about', { title:'About Us' });    
}); 

//Developers List
app.get('/developers', function(req,res){
  var data = [], pageLoad=5, noMorePage=false;

  
  if ( req.query.s ) {
  var ref = firebaseDb.database().ref('/developers/')  
  .orderByChild('name')
  .startAt( req.query.s )
  .endAt( req.query.s + "\uf8ff"); 

  } else {
  var ref = firebaseDb.database().ref('/developers/');
  }
  
  
  var options = { pageSize: 10, retainLastPage: true };

  if (req.query.s) {
  paginator = ref;
  isLastPage = true;
  } else {
  var paginator = new FirebasePaginator(ref, options);
  }

  paginator.once('value').then(function(snapshot){

      if ( snapshot.val() !== null ) {          
        snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            var postData = {
                id: childKey,
                name: childData.name,
                email: childData.email,
                address: childData.address,
                city: childData.city,
                state: childData.state,
                zip: childData.zip
              };            
            data.push(postData);           

        });        
      }  

      res.render( __dirname + '/views/pages/developers', { title:'Developers', data: data, isLastPage: paginator.isLastPage });
  });

}); 

//Adding Developer Form
app.get('/developers/add', function(req,res){
  res.render( __dirname + '/views/pages/developers-add', { title:'Add Developer', data:[], action: 'developers/add' });
}); 

//Editing Developer
app.get('/developers/edit/:id', function(req,res){
  var data = [];

  firebaseDb.database().ref('/developers/' + req.params.id ).once('value').then(function(snapshot) {
    
    if ( snapshot.val() !== null ) {
        data = snapshot.val();
    }
    
    data.id = req.params.id;      
    res.render( __dirname + '/views/pages/developers-add', { title:'Edit Developer', data : data, action: 'developers/add' });

    }, function(error){
    console.log(error);
  });    
    
    
}); 

//Adding Developer Post
app.post('/developers/add', function(req,res){
var updates = {};

// A post entry.
var postData = {
  name: req.body.fullname,
  email: req.body.email,
  address: req.body.address,
  city: req.body.city,
  state: req.body.state,
  zip: req.body.zip
};

//Update
if ( req.body.id ) {

firebaseDb.database().ref('/developers/' + req.body.id).set(postData);

} else {

// Get a key for a new Post.
var newPostKey = firebaseDb.database().ref().child('developers').push().key;    
updates['/developers/' + newPostKey] = postData;
firebaseDb.database().ref().update(updates);

}

res.redirect('/developers');

}); 


app.get('/developers/del/:id', function(req,res){    

  //Delete
  if ( req.params.id ) {    
  firebaseDb.database().ref('/developers/' + req.params.id).remove();  
  }

  res.redirect('/developers');

}); 

/*
  TODOs
*/

app.get('/todos', function(req,res){
  res.render( __dirname + '/views/pages/todos', { title:'Todos' });
}); 

//Todo form
app.get('/todos/add/:id', function(req,res){
  var data = [];

  firebaseDb.database().ref('/developers/' + req.params.id ).once('value').then(function(snapshot) {
    
    if ( snapshot.val() !== null ) {
    data = snapshot.val();
    }
    
    data.id = req.params.id;
    res.render( __dirname + '/views/pages/todos-add', { title:'Todos', data : data, action: 'developers/add' });

    }, function(error){
    console.log(error);
  });
  
});


//Todo list api
app.get('/todos/list/:id', function(req,res){
  var todo=[];  

  firebaseDb.database().ref('/developers/' + req.params.id + '/todos').once('value').then(function(snapshot) {    
    
    if ( snapshot.val() !== null ) {    

    snapshot.forEach(function(childSnapshot) {
      
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      todo.push( {id: childSnapshot.key, task: childData.task} );

    });

    }

    res.json( todo );

  });

});

app.post('/todos/list/:id', function(req,res){
  var ret = {result:0};

  if ( req.params.id && req.body.todo ) {

  var newPostKey = firebaseDb.database().ref('/developers/' + req.params.id).child('todos').push().key;
  firebaseDb.database().ref('/developers/' + req.params.id).child('todos/' + newPostKey).update({task: req.body.todo});
  ret.result = 1;

  }
  
  res.json(ret);
});

//Has an issue in axios post variable
app.post('/todos/del/:id/:todoId', function(req,res){
  var ret = {result:0};

  if (req.params.id && req.params.todoId) {
  firebaseDb.database().ref('/developers/' + req.params.id).child('todos/' + req.params.todoId).remove();
  ret.result = 1;
  }

  res.json(ret);
});



}//module