module.exports = function(app, db) {

  app.get("/add_quiz",(req, res)=>{
      res.render('add_quiz.ejs')
  })
  app.post("/add_quiz",(req, res)=>{
      console.log(req.body);
      console.log(typeof(req.body));
      var quizReq = req.body
      db.collection('quiz').insert(quizReq,(err, post)=>{
        res.redirect('/add_quiz');
      })
  })
  // app.post('/comment/:id', (req, res)=>{
  //   var id = req.params.id
  //   var comment_id = ObjectID();
  //   db.collection('units').update({_id:ObjectID(req.body.unit_id)},{$push:{"comments":{_id:comment_id,name:req.body.name, user_id:req.body.user_id, comment:req.body.comment}}},(error,post)=>{
  //     res.redirect('/syllabus/'+id);
  //   });
  //   console.log(req.body);
  // })
};
