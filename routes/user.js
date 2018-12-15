
/*
 * This file handel all /api/user Routes
 *
 */

// Dependencies
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/users');
const bcrypt = require('bcrypt');



/*
 *  @TODO you can use below to create a more complex Queries
 *  eq  Equal
 *  ne  Eot Equal
 *  gt  Greater Than
 *  gte Greater Than or Equal
 *  ls  Less Than
 *  lte Less Than or Equal
 *  in  Contain
 *  nin Not in
 *  //  Example:
 *  .find({ age: { $gte: 18, $lt: 40 } })  Means that the age should be >= 18 AND less than 40
 *  .find({ age: { $in: [18, 19, 20] } })  Means that the age should equal one of the array items
 *  // Adding OR operator
 *  Keep the find() emplty just like that then write your or operator, just like below
 *  .find().or([ { age: { $gte: 18 } }, { name: 'Hamdon' } ])
 *  //
 *
 *  @TODO
 *  You Can Set a Pagination Like This:
 *
 *  const pageNumber = 1;
 *  const pageSize = 10;
 *  .skip((pageNumber - 1) * pageSize)
 *
 *
 */

// Getting all users
router.get('/', (req, res) => {
  User.find() // This is means WHERE NAME == Hamdon && AGE == 24
  .or([{ name:'husam' }, { age: { $lt: 30 } }])
  .limit(10)  //  This for setting a limit to the requesr
  .sort({ name: -1})  //  Sorting according the name 1 mean asc -1 means desc
  .select({name: 1, age: 1}) //  Means that get me the name and age only
  .then(result => {
    res.send(result);
  }).catch(err => {
    res.status(400).send(err)
  })
});

//  Regastiration a new user
router.post('/register', (req, res) => {
  bcrypt.genSalt(10).then(salt => {
    bcrypt.hash(req.body.password, salt).then(hashed => {
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        age: req.body.age,
        password: hashed,
        email: req.body.email
      });
      user.save().then(result => {
        const token = jwt.sign({id: result._id, exp: Date.now() + 1000 * 60 }, 'key')
        res.header({'X-auth-token': token}).send();
      })
    })
  });
});


router.post('/checKlogin', (req, res) => {
  //  check if there token is there
  
//   if(!token){
//     res.status(400).send(validating.error);
//   };

//   //  decode the token and chekc if it's validate
  
//   let token = jwt.decode(token);

//   if(!jwt.verify(token)){
//     res.status(400).send('token not valid')
//   } else{
//     valid = true;
//   }

//   //  Get the payload from the jsonwebtoken
  
//   let payload = jwt.sign(token);
  
//   //  return('you are logged in')
  
//   if(valid){
//     return('you are logged in')
//   }else{
  
//     //  you have to login
  
//     return('you have to login')
// }
});


router.post('/login', (req, res) => {

  //  check if there is a user data (email & password) in the req body
  
  if(!req.body.email && !req.body.password){
    res.status(404).send('invalide email or password ')
  }
  
  //  chekc if there is such email get the user info
  User.findOne({email: req.body.email}).then(user => {
      if (!user) {
        res.status(404).send('user not found')
      } 
      bcrypt.compare(req.body.password, user.password, (err, resHash) => {
        if (resHash) {
            const token = jwt.sign({email: user.email, _id: user.id}, 'wowpassword');
            res.send({token});
        } else {
          res.status(401).send('password mismatch')
        }
      });  


  }).catch(err => {
      console.log(err.message);
      res.status(404).send(err.message);
  });

  // //  check if the password valid
  // if(!req.body.password===password){
  //   res.status(400).send('invalid password')
  // }
  // //  create a new token and send it back to the user in the response header
  // var token = jwt.sign({username:req.body.username}, secret);
  // return res.status(200).send('You\'re now logged in ')
});




// Getting information
router.get('/:id', (req, res) => {
  User.findById(req.params.id).then(result => {
    if(!result){
      res.status(404).send('There is no such user');
    }
    res.send(result);
  }).catch(err => {
    res.status(400).send(err.message)
  });
});


// Adding a new User
router.post('/', (req, res) => {
  // Setting Schema so i can validate it
  const validating = userValidating(req.body);
  if(validating.error){
    res.status(400).send(validating.error);
  }else {
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      age: req.body.age
    });

    //  Checking the Mongoose Schema Validating
    const v = user.validateSync();
    // If the validateSync returns any string, that means that there is somthing wrong in saving the data
    if(v)
      res.status(400).send('There is somthing wrong');
    //  IF the above if didn't wokred then the program can contiue to the below lines
    user.save()
    .then(result => {
      //  IF the user saved in the database
      res.send('You have added a new user');
      console.log(result);
    })
    .catch(err => {
      //  IF the user hasn't saved in the database

      res.status(401).send(err);
      console.log(err);
    });
  }
});


// PUT
router.put('/:id', (req, res) => {
  // If req.body is valid
  const validating = userValidating(req.body);
  //  If the validation fails
  if(validating.error){
    res.status(400).send(validating.error.details);
  }else {
    //  You can use updateMany
    User.updateOne( { _id: req.params.id },{ $set:req.body } )
    .then(result => {
      res.send(`Number of updated users is ${ result.n }`);
    }).catch(err => {
      res.status(400).send(err);
    });
  }
});


// Deleting a user
router.delete('/:id', (req, res) => {
  User.remove({name: req.params.id}).then(result => {
    res.send(`Number of deleted users is ${result.n}`)
  }).catch(err => {
    res.status(400).send(err);
  });
});



//  To validate the POST PUT requestes
function userValidating(user) {
  const userSchema = {
    'name': Joi.string().min(3).required(),
    'age': Joi.number()
  }
  return Joi.validate(user, userSchema);
}


//  Expoting the router so app.js can use it in a MiddleWare
module.exports = router;
