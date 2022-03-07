const express = require("express");
const config = require("../config.js");
// const path = require("path");
const app = express();
const PORT = 3000;
const db = require("./../Database/index.js");
const { connect, get } = require("./../Database/index.js");

// app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.json());

//params: page, count, sort, product_id
app.get('/reviews', (req, res) => {
  get(req.query, (err, results)=>{
    if (err) {
      res.sendStatus(404)
    }
    if(results) {
      res.status(200).send(results)
    }
  })
})

//params: product_id
app.get('/reviews/meta')

//params: product_id, rating, summary, body, recommend, name, email, photos, characteristics, probably need to add a date as well
app.post('/reviews')

//params: review_id
app.put('/reviews/:review_id/helpful')

//params: review_id
app.put('reviews/:review_id/report')

db.connect(() => {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
});
