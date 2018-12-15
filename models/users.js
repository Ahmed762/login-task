/*
 *  MONGO Table User Model
 *
 */

// Dependency
const mongoose = require('mongoose');

//  Setting the Schema of the user
//  Note: you can set your validation here, it's like a second validation

/*
 *  Some of the validating examples are
 *  required
 *  minlength
 *  maxlength
 *  match       Which takes a regex
 *  enum        takes array, similar to in ['','','']
 */

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  age: {
    type: Number,
    required: [true, 'Age Is Required']
  },
  name: {
    type: String,
    required: function () {
      return this.age > 3 ; //  Hamdon has lost a 5000 IQD
    }
  },
  password: String,
  email: String

});

module.exports = mongoose.model('User', userSchema);