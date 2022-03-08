const express = require("express");
const config = require("../config.js");
// const path = require("path");
const app = express();
const PORT = 3000;
const db = require("./../Database/index.js");
const { connect, getReviews, getMetaReviews, addReview } = require("./../Database/index.js");

// app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.json());

app.get('/reviews', (req, res) => {
  getReviews(req.query, (err, results)=>{
    if (err) {
      res.sendStatus(404)
    }
    if(results) {
      res.status(200).send(results)
    }
  })
})

app.get('/reviews/meta', (req, res) => {
  getMetaReviews(req.query, (err, results)=>{
    if (err) {
      res.sendStatus(404)
    }
    if(results) {
      res.status(200).send(results)
    }
  })
})

//params: product_id, rating, summary, body, recommend, name, email, photos, characteristics, probably need to add a date as well
app.post('/reviews', (req, res) => {
  addReview(req.query, (err, results)=>{
    if (err) {
      res.sendStatus(404)
    }
    if(results) {
      res.status(200).send(results)
    }
  })
})

//params: review_id
app.put('/reviews/:review_id/helpful')

//params: review_id
app.put('reviews/:review_id/report')

db.connect(() => {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
});
