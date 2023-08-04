const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();
//const bcrypt = require('bcrypt');
//const saltRounds = 10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

  


const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';


const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');


app.get('/', function(req,res){
    res.render('home');
})



app.get('/contents', function(req,res){
    res.render('contents', {bookList: null});
})

app.get('/book_details', function(req,res){
    res.render('book_details', { bookInfo: null});
})

main().catch(err => console.log(err));
async function main(){

    app.use(session({
        secret: `${process.env.SECRET}`,
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    
    
    
    
    mongoose.connect(`${process.env.DB_CONNECTION_STRING}/bookviewDB`);
    const userSchema = new mongoose.Schema({
        fullName: String,
        username: String,
        password: String
    });
    userSchema.plugin(passportLocalMongoose);

    const User = new mongoose.model("User", userSchema);

    passport.use(User.createStrategy());
    // passport.use(new LocalStrategy({
    //     usernameField: 'email',
    //   },User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    app.get('/search', function(req,res){
        if(req.isAuthenticated()){
            res.render('search', {error: null});
        }
        else{
            res.redirect("/");

        }
    })

    app.post('/signup', function(req,res){
        
        // bcrypt.hash(req.body.pw1, saltRounds, function(err, hash) {
        //     // Store hash in your password DB.
        //     const newUser = new User({
        //         fullName: req.body.fullName,
        //         email: req.body.email,
        //         password: hash
        //     })
        //     newUser.save()
        //     .then(function(err){
        //         res.render('search', {error: null});
        //     })
        // });
        const fullName = req.body.fullName;
        const username = req.body.username;
        const password = req.body.password;

        User.register({username: username, fullName}, password, function(err, user){
            if(err){
                console.log(username);
                res.redirect('/');
            }else{
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/search");
                })
            }
        })

        
        
    });

    app.post('/login', function(req,res){
        
        // const email = req.body.email;
        // const password = req.body.password;
        // User.findOne({email: email})
        // .then(function(foundUser){
        //     if(foundUser){

        //         bcrypt.compare(password, foundUser.password, function(err, result) {
        //             if (result===true) {
        //                 res.render('search', {error: null});
        //             } else {
        //                 console.log("Password comparison failed");
        //             }
                    
        //         }); 
                
        //     }
        // })
        // .catch(err => console.log(err));

        const user = new User({
            username: req.body.username,
            password: req.body.password
        });
        req.login(user, function(err){
            if(err){
                console.log(err);
            }
            else{
                passport.authenticate("local")(req,res, function(){
                    res.redirect("/search");
                })
            }
        })

    })

    app.get('/logout', function(req,res){
        req.logout(function(err){
            if(err){
                console.log(err);
            }
        })
        res.redirect('/');
    })






};

// Search route

app.post('/search', function(req, res){
    const searchData = req.body.searchData;
    if (!searchData){
        res.render('search', {error: "Please enter a book title."});
        //put a proper yellow warning
        return;
    }

    const bookUrl = `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(searchData)}&key=${process.env.GOOGLE_BOOKS_API_KEY}`;


    axios.get(bookUrl)
        .then(response => {
            const data = response.data;
            //console.log(data);

            if(data.totalItems === 0){
                res.render('search', {error: "No results! Try again."});
                return;
            }

            const bookList = data.items.map(item => item);
            res.render('contents', { bookList });
        })

        .catch(error => {
            res.render('search', { error: 'An error occurred while fetching book information.' });  
        })

});




app.get('/book_details/:id', function (req, res) {

    const bookId = req.params.id;
    
    axios.get(`${GOOGLE_BOOKS_API_URL}/${bookId}?key=${process.env.GOOGLE_BOOKS_API_KEY}`)
      .then(response => {
        const bookInfo = (response.data);
        

        if(!bookInfo){
            res.render('search', { error: 'Book not found.' });
            return;
        }

        if (bookInfo.volumeInfo.description) {
            
            bookInfo.volumeInfo.description = (bookInfo.volumeInfo.description).replace(/<[^>]+>/g, '');
          }

        res.render('book_details', { bookInfo });
      })
      .catch(error => {
        res.render('search', { error: 'An error occurred while fetching book information.' });
      });
  });







app.listen(3000 || process.env.PORT, function(){
    console.log("Server started!");
})