//jshint esversion: 6
const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const http = require('http');
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mongoose = require('mongoose');

const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://admin-eddie:Test123@cluster0-afo4z.mongodb.net/itemsDB', {useNewUrlParser: true});

const productsSchema = new mongoose.Schema ({
    title: String,
    description: String,
    quantity: Number,
    image: { data: Buffer, contentType: String }
});

const imagesSchema = new mongoose.Schema ({
    img: { data: Buffer, contentType: String }
});

const Product = mongoose.model("Product", productsSchema);
const Image = mongoose.model("Image", imagesSchema);

const product = new Product({
    title: 'TestTitle',
    description: 'TestDescription',
    quantity: 0,
});

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

const upload = multer({
  dest: "./public"
});

app.get("/", express.static(path.join(__dirname, "./public")));

app.get('/', function(req, res){
    let day = date.getDate();
    Product.find({}, function(err, foundProduct){
        if (foundProduct.length === 0) {
            product.save(function(err){
                if (err) {
                    console.log('Something is wrong!');
                } else {
                    console.log('Successfully uploaded default to DB.');
                }
            });
            res.redirect('/');
        } else {
            res.render("list", {listTitle: day, product: foundProduct});
        }
    });
});

app.post('/',
    upload.single("file"),
    (req, res) => {
        let title = req.body.itemTitle;
        let description = req.body.itemDescription;
        let quantity = req.body.itemQuantity;

        const product = new Product({
            title: title,
            description: description,
            quantity: quantity,
            image: {data: fs.readFileSync(req.file.path), contentType: req.file.originalname}
        });

        product.save();

        const tempPath = req.file.path;
        const targetPath = path.join(__dirname, "./public/uploads/" + req.file.originalname );

        if (path.extname(req.file.originalname).toLowerCase() === ".png") {
            fs.rename(tempPath, targetPath, err => {
              if (err) return handleError(err, res);
              res
                .status(200)
                .redirect('/');
            });
        } else {
            fs.unlink(tempPath, err => {
              if (err) return handleError(err, res);
              res
                .status(403)
                .contentType("text/plain")
                .end("Only .png files are allowed!");
            });
        }
    }
);

let port = process.env.PORT;
if (port == null || port == ""){
    port = 3000;
}
app.listen(port, function(){
    console.log("Server is listening to port 3000.");
});
