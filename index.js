var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');


//Firebase Real Time
var firebase = require("firebase-admin");
var serviceAccount = require("./bookpafirebase.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
	databaseURL: "https://bookpa-9c0d5.firebaseio.com"
});

var db = firebase.database();

var port = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());
app.use(cors());


app.get('/books',  function (req, res)  {  

	res.setHeader('Content-Type', 'application/json');

	var booksReference = db.ref("books");

	//Attach an asynchronous callback to read the data
	booksReference.on("value", 
				function(snapshot) {					
					res.json(snapshot.val());
					booksReference.off("value");
					}, 
				function (errorObject) {
					res.send("The read failed: " + errorObject.code);
				});
  
});


app.get('/topsellers',  function (req, res)  {  

		res.setHeader('Content-Type', 'application/json');

		var booksReference = db.ref("topsellers");
	
		//Attach an asynchronous callback to read the data
		booksReference.on("value", 
					function(snapshot) {					
						res.json(snapshot.val());
						booksReference.off("value");
						}, 
					function (errorObject) {
						res.send("The read failed: " + errorObject.code);
					});
  
});


app.get('/book/:bookid',  function (req, res)  {  
  	
		res.setHeader('Content-Type', 'application/json');
		var bookid = Number(req.params.bookid);
		var booksReference = db.ref("books");

		//Attach an asynchronous callback to read the data
		booksReference.orderByChild("bookid").equalTo(bookid).on("child_added", 
			function(snapshot) {
				res.json(snapshot.val());
				booksReference.off("value");
				}, 
			function (errorObject) {
				res.send("The read failed: " + errorObject.code);
				});

});


app.get('/lastorderid',  function (req, res)  {  
  	
	res.setHeader('Content-Type', 'application/json');

	var ordersReference = db.ref("lastOrderId");

	ordersReference.on("value", 
				function(snapshot) {					
					res.json(snapshot.val());
					ordersReference.off("value");
					}, 
				function (errorObject) {
					res.send("The read failed: " + errorObject.code);
			});

});


app.put('/lastorderid',  function (req, res)  {  
	
	var orderId = Number(req.body.orderId);

	//Update to Firebase
	var ordersReference = db.ref("lastOrderId");
	if(ordersReference !== null) {

		ordersReference.set(orderId, 
				function(error) {
					if (error) {
						res.send("Data could not be saved." + error);
					} 
					else {
						res.send("" );
					}
			});
	}


});




app.post('/order',  function (req, res)  {  

	var orderId = req.body.orderId;	
	var name = req.body.name; 	
	var address = req.body.address;
	var province = req.body.province;
	var postal=req.body.postal;
	var total=req.body.total;
	var orderdetail=req.body.orderdetail;

	var referencePath = '/orders/' + orderId + '/';
	

	//Add to Firebase
	var bookReference = db.ref(referencePath);
	if(bookReference !== null) {

	bookReference.update({orderId:orderId, name:name, address: address, province: province, postal: postal, total: total, orderdetail: orderdetail}, 
				function(error) {
					if (error) {
						res.send("Data could not be saved." + error);
					} 
					else {
						res.send("" );
					}
			});
	}

});


app.listen(port, function () {
    console.log("Server is up and running...");
});
