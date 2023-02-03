const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const Schema = mongoose.Schema;

// this is the old Schema we used pre-Passport
// const userSchema = new Schema({

//     username: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true,
//     },
//     admin: {
//         type: Boolean,
//         default: false
//     }
// });

const userSchema = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    },
    facebookId: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema)