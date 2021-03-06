const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Merchuser101:ilovemerch27@merch-store.i0rwu.mongodb.net/merchStoreDB", {useNewUrlParser: true});





const merchandiseSchema = {
  image: String,
  name: String,
  description: String,
  price: Number
};


const Merch = mongoose.model("Merchandise", merchandiseSchema);

const item1 = new Merch({
  image: "shirt.jpg",
  name: "Plain Blue Shirt",
  description: "One of the most exquisite products that are available is this magnificent blue shirt that comes with internal cooling and style!",
  price: 20
});

const item2 = new Merch({
  image: "green-hoodie.jpg",
  name: "Green Hoodie",
  description: "An amazing product that keeps any wearer warm and styled.",
  price: 40
});

const item3 = new Merch({
  image: "black-hat.jpeg",
  name: "Black Hat",
  description: "A hat of the ages. When you are seen wearing this hat you are automatically more stylish than anyone else.",
  price: 10
});

const item4 = new Merch({
  image: "black-shoes.jpg",
  name: "Black Shoes",
  description: "Comfy, Stylish and Stylish what more do you need?",
  price: 50
});

const item5 = new Merch({
  image: "black-and-brown-backpack.jpg",
  name: "Black and Brown Backpack",
  description: "This piece of merchandise can carry all of your belongings with ease.",
  price: 30
});

const item6 = new Merch({
  image: "mansion.jpg",
  name: "Mansion",
  description: "This is one of the best houses you can ever buy. This house is 21,000 square feet with 9 bedrooms, 18 bathrooms, a detached guest home as well as a subterranean 16-car garage.",
  price: 7000000
});

const item7 = new Merch({
  image: "dog.jpg",
  name: "Dog",
  description: "A cute dog that is friendly and likes to play.",
  price: 1000
});

const item8 = new Merch({
  image: "pirate-ship.jpg",
  name: "Pirate Ship",
  description: "A vessel that can take you anywhere you want to go overseas. Also comes with a guide on how to drive a pirate ship. We are not liable for any damages that may come to you or the ship.",
  price: 3000000
});

const item9 = new Merch({
  image: "red-car.jpg",
  name: "Red car",
  description: "A beautiful red car that has many features such as heated seats, self-driving and, is also powered by electricity.",
  price: 50000
});

const item10 = new Merch({
  image: "snickers.jpg",
  name: "Snickers",
  description: "A delicious piece of candy that consists of nougat topped with caramel and peanuts and is enrobed in milk chocolate.",
  price: 1
});



const emptyMerchItem = new Merch({

});

const defaultItems = [item1, item2, item3 , item4, item5, item6, item7, item8, item9, item10];
const emptyMerch = [];

const cartSchema = {
  merch: [merchandiseSchema],
  username: {
    type: String,
    unique: true
  },
};

const Cart = mongoose.model("Cart", cartSchema);

const userSchema = {
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true

  },
  email:  {
    type: String,
    required: true
  }
};

const User = mongoose.model("User", userSchema);

var userUsername = null;
var userCreated = false;
var incorrect = false;

app.get("/", function(req, res){
  // res.render("store");
  incorrect = false





  Merch.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Merch.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        } else{
          console.log("Successfully saved default items to Database");
        }
      });
      res.redirect("/");
    } else{

      if(userUsername === null){
        res.redirect("/login")
      }

      res.render("store", {Merchandise: foundItems});
    }
  });
});

app.get("/signout", function(req, res){
  userUsername = null;
  res.redirect("/");
});

app.get("/login", function(req, res){
  if(incorrect === true){
      res.render("login",{title: "Incorrect Username or Password"} );
  } else{
      res.render("login",{title: "Please sign in"} );
  }

});

app.get("/signup", function(req, res){

  if(userCreated === false){
    userCreated = true;
    res.render("signup", {title: "Username already taken"});
  } else{
      res.render("signup", {title: "Create an account"});
  }
});

app.get("/cart", function(req, res){
    Cart.findOne({username: userUsername}, function(err, foundCart){
      if(err){
        console.log(err);
      } else{
        // console.log(foundCart.merch);
        if(foundCart.merch.length === 0){
          res.render("empty");
        } else{
          // console.log(foundCart.merch);
          const merch = foundCart.merch;
          var totalPrice = 0;
          const cartSize = merch.length;
        merch.forEach(function(item){
          totalPrice = totalPrice + parseInt(item.price);
        })
        res.render("cart", {Merch: merch, totalPrice: totalPrice, cartSize: cartSize});
        }
      }

    });
});

app.get("/:customItemId", function(req, res){
  const customItemId = req.params.customItemId;

    Merch.findOne({_id: customItemId}, function(err, foundItem){
      if(err){
        console.log(err);
      } else{
        res.render("item", {itemId: foundItem._id, itemImage: foundItem.image, itemName: foundItem.name, itemDescription: foundItem.description, itemPrice: foundItem.price});

      }


      });

});

app.post("/", function(req, res){
    const itemId = req.body.itemId;
    console.log(itemId);
      res.redirect("/" + itemId);

});

app.post("/signup", function(req,res){
    userCreated = true;
  res.redirect("/signup")
});

app.post("/create", function(req,res){
  const inputUsername = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  // if(inputUsername === null){
  //   res.redirect("/signup");
  // } else if(password === null){
  //     res.redirect("/signup");
  // } else if( email === null){
  //   res.redirect("/signup");
  // }

  User.findOne({username: inputUsername}, function(err, foundUser){
    if(err){
      console.log(err);
    } else{
      if(foundUser === null){

        const user = new User({
          username: inputUsername,
          password: password,
          email: email,
        });
        user.save();
        userCreated = true;
        incorrect = false

        const userCart = new Cart({
          merch: [],
          username: inputUsername
        })

        userCart.save();

        res.redirect("/login")
      } else{
        userCreated = false;
        res.redirect("/signup");
      }
    }

  });
});

app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({username: username, password: password}, function(err, foundUser){
    if(err){
      console.log(err);
    } else{
      console.log(foundUser);
      if(foundUser === null){
        incorrect = true;
        res.redirect("/login")
      } else{
        userUsername = username;
        res.redirect("/");
      }
    }
  });

});

app.post("/add", function(req, res){
    const itemId = req.body.itemId;

    Merch.findOne({_id: itemId}, function(err, foundItem){
      // console.log(foundItem);
      // const cartItem = new Cart({
      //   merch: foundItem
      // });

      Cart.findOne({username: userUsername}, function(err, foundCart){
        foundCart.merch.push(foundItem);
        foundCart.save();
      });


      // cartItem.save();

    });

    res.redirect("/");

});

app.post("/delete", function(req, res){
  const itemName = req.body.itemName;

  Cart.findOneAndUpdate({username: userUsername}, {$pull: {merch: {}}}, function(err, foundList){
    if(err){
      console.log(err);
    } else{
      res.redirect("/cart")
    }
  });

})

app.post("/checkout", function(req, res){
  const totalPrice = req.body.totalPrice;

  res.render("checkout", {totalPrice: totalPrice})

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started Successfully");
});
