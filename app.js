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

// const userSchema = {
//   username: {
//     type: String,
//     unique: true
//   },
//   password: String
// };

// const User = mongoose.model("User", userSchema);

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

const defaultItems = [item1, item2, item3];

const cartSchema = {
  merch: merchandiseSchema
};

const Cart = mongoose.model("Cart", cartSchema);

app.get("/", function(req, res){
  // res.render("store");



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

app.get("/cart", function(req, res){
  // res.render("cart");

    Cart.find({}, function(err, foundItems){

      if(foundItems.length === 0){
        res.render("empty");
      } else{
        const merch = [];
        foundItems.forEach(function(item){

          merch.push(item.merch);

        });

        var totalPrice = 0;
        merch.forEach(function(item){
          totalPrice = totalPrice + parseInt(item.price);
        });

        console.log(totalPrice);




        res.render("cart", {Merch: merch, totalPrice: totalPrice});



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

app.post("/add", function(req, res){
    const itemId = req.body.itemId;

    Merch.findOne({_id: itemId}, function(err, foundItem){

      const cartItem = new Cart({
        merch: foundItem
      });

      cartItem.save();

    });

    res.redirect("/");

});

app.post("/checkout", function(req, res){
  const totalPrice = req.body.totalPrice;

  res.render("checkout", {totalPrice: totalPrice})

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
