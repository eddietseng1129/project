//jshint esversion: 6
const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const http = require('http');
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

const titles = ['test'];
const descriptions = [];
const quantities = [];

const products = [
    {
        title: 'TestTitle',
        description: 'TestDescription',
        quantity: 'TestQuantity',
        image: 'TestImage'
    }
];

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

const upload = multer({
  dest: "./project/public"
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

app.get("/", express.static(path.join(__dirname, "./public")));

app.get('/', function(req, res){
    let day = date.getDate();
    res.render("list", {listTitle: day, product: products});
});

app.post('/',

    // console.log(req);
    // let title = req.body.itemTitle;
    // let description = req.body.itemDescription;
    // let quantity = req.body.itemQuantity;
    // console.log(title);
    // console.log(description);
    // console.log(quantity);
    // products.push({title: title, description: description, quantity: quantity});
    // console.log(products);

    upload.single("file" /* name attribute of <file> element in your form */),
    (req, res) => {

        const tempPath = req.file.path;
        const targetPath = path.join(__dirname, "./public/uploads/" + req.file.originalname );
        console.log(targetPath);
        if (path.extname(req.file.originalname).toLowerCase() === ".png") {
            fs.rename(tempPath, targetPath, err => {
              if (err) return handleError(err, res);

              res
                .status(200)
                .contentType("text/plain")
                .end("File uploaded!");
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
        res.redirect('/');
}
);

app.listen(3000, function(){
    console.log("Server is listening to port 3000.");
});
