
const { MongoClient } = require('mongodb');
const config = require('./../config.js');

// Replace the uri string with your MongoDB deployment's connection string.
const uri = 'mongodb://localhost/27017';
const dbName = 'SDCtest';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    const db = client.db(dbName);
    const reviews = db.collection('reviews');

    // query for movies that have a runtime less than 15 minutes
    // const query = { runtime: { $lt: 15 } };

    const options = {
      // sort returned documents in ascending order by title (A->Z)
      sort: { title: 1 },
      // Include only the `title` and `imdb` fields in each returned document
      projection: { _id: 0, title: 1, imdb: 1 },
    };

    // const cursor = movies.find(query, options);
    const cursor = reviews.find();

    // print a message if no documents were found
    if ((await cursor.count()) === 0) {
      console.log("No documents found!");
    }

    // replace console.dir with your callback to access individual elements
    await cursor.forEach((doc) => {
      console.dir(doc);
    });
  } finally {
    await client.close();
  }
}
run().catch(console.dir);


// const mongoose = require('mongoose');
// // mongoose.connect('mongodb://localhost/27017:SDCtest');
// var mongoDB = 'mongodb://localhost/27017:SDCtest';
// mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

// //Get the default connection
// var db = mongoose.connection;

// //Bind connection to error event (to get notification of connection errors)
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// const prods = db.reviews.find({});
// console.log(prods);

// const { MongoClient } = require("mongodb");
// // Connection URI
// const uri =
//   "mongodb+srv://localhost:27017/?maxPoolSize=20&w=majority";
// // Create a new MongoClient
// const client = new MongoClient(uri);
// async function run() {
//   try {
//     // Connect the client to the server
//     await client.connect();
//     // Establish and verify connection
//     await client.db("SDCtest").command({ ping: 1 });
//     console.log("Connected successfully to server");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);


// db.find({review_id: 1})

// const dfd = require("danfojs-node")
// dfd.readCSV("./mock_reviews.csv")
// .then(df => {
//   console.log('works')
// })
// .catch(err => {
//   console.log(err)
// })


//commandline to add files:
// mongoimport --db=SDC --collection=reviews --type=csv --headerline --file=Data/reviews.csv
// mongoimport --db=SDC --collection=reviews_photos --type=csv --headerline --file=Data/reviews_photos.csv
// mongoimport --db=SDC --collection=characteristics --type=csv --headerline --file=Data/characteristics.csv
// mongoimport --db=SDC --collection=characteristic_reviews --type=csv --headerline --file=Data/characteristic_reviews.csv

//type 'mongo' in the command line to switch to mongodb shell. allows access to the db/collections

//creating indexes on a duplicate key:
//db.reviews.createIndex({ "product_id": 1 }, {"unique": false})

//searching an indexed key and verifying it only searched the relevant files
//db.reviews.find( {"product_id":12}).explain("executionStats")

//search for multiple different ids
//db.reviews.find( {product_id:{$in: [12, 13]}}).explain("executionStats")

//gets all ids without duplicates
//db.reviews.distinct("product_id")


//**************** */
//4 files added to db.
// product_id in reviews is indexed.
// product_id in characteristics is indexed.
//**************** */