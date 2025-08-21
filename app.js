var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var multer = require("multer");
var upload = multer();
var session = require("express-session");
var cookieParser = require("cookie-parser");

app.set("view engine", "pug");
app.set("views", "./views");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
app.use(cookieParser());
app.use(session({
    secret: "sample-secret",
    resave: false,
    saveUninitialized: false
}));

var Users = [];

function isAdmin(req, res, next){
    if(req.session.user){
        next();
    }
    else{
        res.send("You are not allowed.");
    }
}

app.get("/", function(req,res){
    res.render("main", {
        user: req.session.user
    });
})

app.get("/signup", function (req, res) {
    res.render("signup");
});

app.post("/signup", function (req, res) {
    if (!req.body.id || !req.body.password) {
        res.status(400);
        res.send("Id and password can not be empty.");
    }
    else {
        const userFound = Users.find((user) => user.id === req.body.id);
        if (userFound !== undefined) {
            res.send("User already exist!!!");
        }
        else {
            var newUser = { id: req.body.id, password: req.body.password, authenticationLevel: req.body.level};
            Users.push(newUser);
        }
    }
    let userListHtml = `<h2>All users:</h2><ul>`;
    Users.forEach((user) => {
        userListHtml += `<li>${user.id}</li>`;
    })
    userListHtml += `</ul>`;

    userListHtml += `
        <script>
            setTimeout(() => { window.location.href = "/"; }, 2000);
        </script>
    `;

    res.send(userListHtml);
});

app.get("/login", function(req,res){
    res.render("login");
})

app.post("/login", function(req, res){
    const userFind = Users.find((user) => req.body.id === user.id);
    if(userFind !== undefined){
        if(userFind.password === req.body.password){
            req.session.user = userFind;
            res.redirect("/");
        }
        else{
            res.send("Wrong password.");
        }
    }
    else{
        res.send("No user found in this id.");
    }
})

app.get("/logout", function(req, res){
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/");
        }
    });
})

app.listen(3000); 
