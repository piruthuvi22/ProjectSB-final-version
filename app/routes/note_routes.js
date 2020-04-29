const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
var ObjectID = require('mongodb').ObjectID;
const multer = require('multer');
const fs = require('fs');
const moment = require('moment');
const quizRoutes = require('./quiz_routes');

let notific;

module.exports = function (app, db) {
  quizRoutes(app, db);

  app.get('/room', isLoggedIn, (req, res) => {
    db.collection('subjects').find({}).toArray((err, subjects) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        res.render('room.ejs', { "subjects": subjects, "user": req.user, notification: notific })
      }
    });

  })

  app.get('/chat', isLoggedIn, (req, res) => {
    if (req.user) {
      res.render('chat', { user: req.user, notification: notific })
    } else {
      res.render('chat', { user: req.user })
    }
  })

  //home
  app.get('/', (req, res) => {
    if (req.user) {
      res.render('welcome', { user: req.user, notification: notific })
    } else {
      res.render('welcome', { user: req.user })
    }
  });

  //user model
  const User = require('../models/User')

  //register
  app.get('/users/login', (req, res) => res.render('login'))

  //login
  app.get('/users/register', (req, res) => res.render('register'))
  // Logout
  app.get('/users/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  });

  // Register
  //email to username change
  app.post('/users/register', (req, res) => {

    var img = fs.readFileSync("app/public/images/profile.png");
    var encode_image = img.toString('base64');
    // Define a JSONobject for the image attributes for saving to database

    var finalImg = {
      contentType: "app/public/images/profile.png".mimetype,
      image: new Buffer(encode_image, 'base64'),
      userID: req.body.username
    };

    db.collection('images').insert(finalImg, (err, result) => {
      console.log(result)
      if (err) return console.log(err)
      console.log('saved to database')
    })

    const { name, username, password, password2 } = req.body;
    let errors = [];

    if (!name || !username || !password || !password2) {
      errors.push({ msg: 'Please enter all fields' });
    }

    if (password != password2) {
      errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
      res.render('register', {
        errors,
        name,
        username,
        password,
        password2
      });
    } else {
      User.findOne({ username: username }).then(user => {
        if (user) {
          errors.push({ msg: 'username already exists' });
          res.render('register', {
            errors,
            name,
            username,
            password,
            password2
          });
        } else {

          const newUser = new User({
            name,
            username,
            password
          });
          console.log(newUser);

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  req.flash(
                    'success_msg',
                    'You are now registered and can log in'
                  );
                  console.log(newUser);

                  res.redirect('/users/login');
                })
                .catch(err => console.log(err));
            });
          });
        }
      });
    }
  });

  // quiz route
  app.get("/quiz", isLoggedIn, (req, res) => {
    const quizData = db.collection('quiz').find({}).toArray((err, quiz) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        res.render('quiz.ejs', { "quiz": quiz, "user": req.user, notification: notific })
      }
    });
  })

  // Login
  app.post('/users/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/profile',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  });

  //HOME
  var subid
  app.get('/subject', isLoggedIn, (req, res) => {
    db.collection('subjects').find({}).toArray((err, subjects) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        res.render('subject.ejs', { "subjects": subjects, "user": req.user, notification: notific })
      }
    });
  });

  app.get('/profile', isLoggedIn, (req, res) => {
    db.collection('notification').find({ forWhome: req.user._id }).toArray((err, notification) => {
      if (err) {
        res.send({ error: 'An error has occurred' })
      } else {
        notific = notification;
        notific.reverse();
        notific = notific.slice(0, 10)
        res.render('profile.ejs', { user: req.user, notification: notification })
      }
    });
  })

  app.get('/tutor/:id', isLoggedIn, (req, res) => {
    var id = new ObjectID(req.params.id);
    const data = db.collection('subjects').findOne({ "_id": id }, (err, sub) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        res.render('tutors.ejs', { "sub": sub, user: req.user, notification: notific })
      }
    });
  });

  var tuid;

  app.post('/tutor', (req, res) => {
    tubid = ObjectID(req.body.tutor);
    subid = ObjectID(req.body.subject);
    console.log(tubid);
    console.log(subid);
  });



  app.get('/syllabus', isLoggedIn, (req, res) => {
    var query = { 'subjectid': subid, 'tutorid': tubid }
    const data = db.collection('units').find(query).toArray((err, units) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        res.render('syllabus.ejs', { "units": units, user: req.user, notification: notific })
      }
    });
  });

  app.get('/live', isLoggedIn, (req, res) => {
    var query = { 'subjectid': subid, 'tutorid': tubid }
    db.collection('live').findOne(query, ((err, live) => {
      if (err) {
        res.send({ 'error': 'An error found' });
      } else {
        res.render('live.ejs', { user: req.user, notification: notific, live: live })
      }
    }))

  })

  app.post('/comment_live/:id', (req, res) => {
    var id = req.params.id
    var comment_id = ObjectID();
    db.collection('live').update({ _id: ObjectID(req.body.unit_id) }, { $push: { "comments": { _id: comment_id, name: req.body.name, user_id: req.body.user_id, comment: req.body.comment, time: moment().format("ddd, MMM Do YYYY, h:mm:ss a") } } }, (error, post) => {
      res.redirect('/live');
    });
    console.log(req.body);
  })

  app.post('/reply_live/:id', (req, res) => {
    var id = req.params.id
    var reply_id = ObjectID();
    var notification = { forWhome: ObjectID(req.body.commentUser_id), what: "replied your comment in live page", who: [ObjectID(req.body.user_id), req.body.name], where: ObjectID(req.body.unit_id), time: moment().format("ddd, MMM Do YYYY, h:mm:ss a") };
    db.collection('notification').insert(notification);
    db.collection('live').update({ "_id": ObjectID(req.body.unit_id), "comments._id": ObjectID(req.body.comment_id) }, { $push: { "comments.$.replies": { _id: reply_id, name: req.body.name, user_id: req.body.user_id, reply: req.body.reply } } }, (error, post) => {
      res.redirect('/live');
    })
  })

  app.post('/reply_live_delete/:id', (req, res) => {
    var id = req.params.id
    db.collection('live').update({ _id: ObjectID(req.body.unit_id), "comments._id": ObjectID(req.body.comment_id) }, { $pull: { "comments.$.replies": { _id: ObjectID(req.body.reply_id) } } }, (error, post) => {
      res.redirect('/live');
    });
  })

  app.post('/comment_live_delete/:id', (req, res) => {
    var id = req.params.id
    db.collection('live').update({ _id: ObjectID(req.body.unit_id) }, { $pull: { "comments": { _id: ObjectID(req.body.comment_id) } } }, (error, post) => {
      res.redirect('/live');
    });
  })

  app.get('/profilepage', isLoggedIn, (req, res) => {
    db.collection('notification').find({ forWhome: req.user._id }).toArray((err, notification) => {
      if (err) {
        res.send({ error: 'An error has occurred' })
      } else {

        res.render('profilePage.ejs', { user: req.user, notification: notification });
      }
    })
  })

  // Add other user informations
  app.post('/userinfo/:id', (req, res) => {
    const id = req.params.id;
    const details = { '_id': new ObjectID(id) };
    const info = { name: req.body.name, mobile: req.body.mobile, dob: req.body.dob, email: req.body.email, district: req.body.district, school: req.body.school, grade: req.body.grade };
    db.collection('users').update(details, { $set: info }, { multi: true }, (err, result) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      }
      else {
        console.log(info);
        res.redirect("/profilepage");
      }
    });
  });

  // SET STORAGE
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
      let a = file.originalname.split('.')
      cb(null, `${file.fieldname}-${Date.now()}.${a[a.length - 1]}`)
    }
  })

  const upload = multer({ storage: storage })

  // Uploading image
  app.post('/uploadimage/:username', upload.single('image'), (req, res) => {
    // const Username = req.params.username;
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');
    console.log(req.file.path);

    // Define a JSONobject for the image attributes for saving to database

    var finalImg = {
      contentType: req.file.mimetype,
      image: new Buffer(encode_image, 'base64'),
      userID: req.params.username
    };

    db.collection('images').update({ "userID": req.params.username }, finalImg, { upsert: true }, (err, result) => {
      console.log(result)
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/profilepage')
    })
  })

  // Get image by UserID
  app.get('/images/:username', (req, res) => {
    db.collection('images').findOne({ "userID": req.params.username }, (err, result) => {
      if (err) return console.log(err);

      //console.log(result);
      res.contentType('image/jpeg');
      res.send(result.image.buffer)

    })

  })

  app.get('/syllabus/:id', isLoggedIn, (req, res) => {

    var id = req.params.id;
    const data = db.collection('units').findOne({ "_id": ObjectID(id) }, (err, units) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        const data = db.collection('units').find({ subjectid: subid }).toArray((err, unit) => {
          if (err) {
            res.send({ 'error': 'An error has occurred' });
          } else {
            res.render('syllabusOne.ejs', { "units": units, unit: unit, user: req.user, notification: notific })
          }
        });
      }
    });
  });

  app.get('/unit', (req, res) => {
    const data = db.collection('units').find({ subjectid: "sub01" }).toArray((err, units) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        // res.send(units);
        res.render('units.ejs', { "units": units })
      }
    });
  });

  app.post('/comment/:id', (req, res) => {
    var id = req.params.id
    var comment_id = ObjectID();
    db.collection('units').update({ _id: ObjectID(req.body.unit_id) }, {
      $push: {
        "comments": {
          _id: comment_id, name: req.body.name, user_id: req.body.user_id, comment: req.body.comment, time: moment().format("ddd, MMM Do YYYY, h:mm:ss a")
        }
      }
    }, (error, post) => {
      res.redirect('/syllabus/' + id);
    });
    console.log(req.body);
  })

  app.post('/comment_delete/:id', (req, res) => {
    var id = req.params.id
    db.collection('units').update({ _id: ObjectID(req.body.unit_id) }, { $pull: { "comments": { _id: ObjectID(req.body.comment_id) } } }, (error, post) => {
      res.redirect('/syllabus/' + id);

    });
    console.log(req.body);
  })

  app.post('/reply_delete/:id', (req, res) => {
    var id = req.params.id
    db.collection('units').update({ _id: ObjectID(req.body.unit_id), "comments._id": ObjectID(req.body.comment_id) }, { $pull: { "comments.$.replies": { _id: ObjectID(req.body.reply_id) } } }, (error, post) => {
      res.redirect('/syllabus/' + id);
    });
    console.log(req.body);
  })

  app.post('/reply/:id', (req, res) => {
    var id = req.params.id
    var reply_id = ObjectID();
    var notification = { forWhome: ObjectID(req.body.commentUser_id), what: "replied your comment", who: [ObjectID(req.body.user_id), req.body.name], where: ObjectID(req.body.unit_id), time: moment().format("ddd, MMM Do YYYY, h:mm:ss a") };
    db.collection('notification').insert(notification);
    db.collection('units').update({ "_id": ObjectID(req.body.unit_id), "comments._id": ObjectID(req.body.comment_id) }, { $push: { "comments.$.replies": { _id: reply_id, name: req.body.name, user_id: req.body.user_id, reply: req.body.reply, time: moment().format("ddd, MMM Do YYYY, h:mm:ss a") } } }, (error, post) => {
      res.redirect('/syllabus/' + id);
    })
  })

  // ====================================================
  // View the PDF files on tutes.ejs
  // Code by Piruthuvi
  // ====================================================
  const mongoURI = 'mongodb://schoolbagapp:sclbag1995@cluster0-shard-00-00-is9ul.mongodb.net:27017,cluster0-shard-00-01-is9ul.mongodb.net:27017,cluster0-shard-00-02-is9ul.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority';

  // Create mongo connection
  const conn = mongoose.createConnection(mongoURI, { useUnifiedTopology: true, useNewUrlParser: true });

  // Init gfs
  let gfs;

  conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('tutes_pdf');
  });


  // GET data
  app.get('/tutes', isLoggedIn, (req, res) => {
    var query = { "metadata.subjectid": subid, "metadata.tutorid": tubid }
    // var query22 = { 'subjectid': subid, 'tutorid': tubid }
    gfs.files.find(query).toArray((err, files) => {
      // Check if files
      if (!files || files.length === 0) {
        res.render('tutes', { files: false, notification: notific, user: req.user, });
      } else {
        files.map(file => {
          if (
            file.contentType === 'image/jpeg' ||
            file.contentType === 'image/png'
          ) {
            file.isImage = true;
          } else {
            file.isImage = false;
          }
        });
        res.render('tutes', { files: files, user: req.user, notification: notific });
      }
    });
  });


  app.get('/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
      // If File exists this will get executed
      const readstream = gfs.createReadStream(file.filename);
      return readstream.pipe(res);
    });
  });



  app.use(function (req, res, next) {
    res.status(404).render('error.ejs', { title: "Sorry, page not found" });
  });



};




// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}
