//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const date = require(__dirname + "/date.js");
const _=require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin_haseeb:haseeb9081@cluster0.tv3gyhu.mongodb.net/todolistDB");
// item schema
const itemSchema={
  name:String,
}
const Item =mongoose.model("item",itemSchema);
const i1=new Item({name:"home_work"});
const i2=new Item({name:"again home_work"});
const i3=new Item({name:"surprise !!! more ...home_work"});
const defaultItems=[i1,i2,i3];
// list schema
const listschema={
  name:String,
  itemsArray:[itemSchema],
}
const List=mongoose.model("list",listschema);





const day = date.getDate(); 
// get request+++++++++++++++++++++++++++++++
app.get("/", function(req, res) {


Item.find({},function(err,results){
  
  if(results.length==0){
    Item.insertMany(defaultItems,function(err){
    if(err){
      console.log(err);
  }else{console.log("insertion succesfull!");}
  });res.redirect("/");}


    console.log(results);
    res.render("list", {listTitle: day, newListItems: results});
  })
});









// the dynamic page handler
app.get("/:topic",function(req,res){
  let topick=req.params.topic;
  topick=_.upperFirst(topick);
  List.findOne({name:topick},function(err,results){if(err){console.log(err);}else{

if(!results){
  const list=new List({name:topick,
    itemsArray:defaultItems,});
  list.save();
res.redirect("/"+topick)}
  else{
    res.render("list",{listTitle:results.name,newListItems:results.itemsArray})}}
  }); 
  });







// to delete something from data base
app.post("/delete",function(req,res){
  const listName=req.body.listName;
 const checkeditemID= req.body.deleteT;
if(listName==day){
  Item.deleteOne({_id: checkeditemID },function(err){
    if(err){console.log(err);}else{console.log("removed succesfully");}
    });res.redirect("/");}
    
    else{
      List.findOneAndUpdate({name:listName},{$pull:{itemsArray:{_id:checkeditemID}}},function(err,results){
        if(!err){
          res.redirect("/"+listName);        }else{console.log(err);}
      })

    }
});


// post request hendled here!
app.post("/", function(req, res){
    
  const item = req.body.newItem;
 const list=req.body.list;  
 const i=new Item({name:item});
 if(list==day){
 i.save();res.redirect("/");}else{
  List.findOne({name:list},function(err,found){
    if(!err){
      found.itemsArray.push(i);
      found.save();
      res.redirect("/"+list);
    }
  })
 }
 
});

   

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
