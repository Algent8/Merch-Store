const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/merchStoreDB", {useNewUrlParser: true});





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
  description: "An amazing product that keeps any wearer warm and styled",
  price: 40
});

const item3 = new Merch({
  image: "black-hat.jpeg",
  name: "Black Hat",
  description: "A hat of the ages. When your seen wearing this hat you are automatically more stylish than any else",
  price: 10
});

const emptyMerchItem = new Merch({

});

const defaultItems = [item1, item2, item3];
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
    unique: true
  },
  password: String,
  email: String
};

const User = mongoose.model("User", userSchema);

var userUsername = null;
var userCreated = false;
var incorrect = false;

app.get("/", function(req, res){
  // res.render("store");
  incorrect = false

  if(userUsername === null){
    res.redirect("/login")
  }



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
        merch.forEach(function(item){
          totalPrice = totalPrice + parseInt(item.price);
        })
        res.render("cart", {Merch: merch, totalPrice: totalPrice});
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

  Cart.findOneAndUpdate({username: userUsername}, {$pull: {merch: {name: itemName}}}, function(err, foundList){
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

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
