const mongoose = require('mongoose');

// Defining the User schema 

const UserSchema = new mongoose.Schema({
    userName : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
    },
    role : {
        type: String,
        default : 'user',
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
});

// creating User model from the schema 

const User = mongoose.model('User',UserSchema);
module.exports = User;