const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const bcrypt = require('bcrypt');
const saltRounds = 10;

  


const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';


const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');


app.get('/', function(req,res){
    res.render('home');
})

app.get('/search', function(req,res){
    res.render('search', {error: null});
})

app.get('/contents', function(req,res){
    res.render('contents', {bookList: null});
})

app.get('/book_details', function(req,res){
    res.render('book_details', { bookInfo: null});
})

main().catch(err => console.log(err));
async function main(){
    mongoose.connect(`${process.env.DB_CONNECTION_STRING}/bookviewDB`);
    const userSchema = new mongoose.Schema({
        fullName: String,
        email: String,
        password: String
    });

    const User = new mongoose.model("User", userSchema);

    app.post('/signup', function(req,res){
        
        bcrypt.hash(req.body.pw1, saltRounds, function(err, hash) {
            // Store hash in your password DB.
            const newUser = new User({
                fullName: req.body.fullName,
                email: req.body.email,
                password: hash
            })
            newUser.save()
            .then(function(err){
                res.render('search', {error: null});
            })
        });

        
    })

    app.post('/login', function(req,res){
        console.log(req.body.email);
        const email = req.body.email;
        const password = req.body.password;
        User.findOne({email: email})
        .then(function(foundUser){
            if(foundUser){

                bcrypt.compare(password, foundUser.password, function(err, result) {
                    if (result===true) {
                        res.render('search', {error: null});
                    } else {
                        console.log("Password comparison failed");
                    }
                    
                });


    
                
            }
        })
        .catch(err => console.log(err));
    })








}

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