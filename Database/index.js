const mongoClient = require('mongodb').MongoClient;
const mongoDbUrl = 'mongodb://localhost/27017';
const client = new mongoClient(mongoDbUrl);
const dbName = 'SDC';
const { sort } = require('./../Server/helpers.js');
let mongodb;
let reviewsCollection;
let metaReviewsCollection;

async function connect(cb) {
  try {
    await client.connect();
    mongodb = client.db(dbName);
    reviewsCollection = mongodb.collection('merged_reviews');
    metaReviewsCollection = mongodb.collection('reviews_characteristics_merged');
    if (typeof (cb) === 'function') {
      cb();
    }

  } catch (e) {
    console.log({ e })
  }
}
//create database queries in here
async function get(params, cb) {
  let product_id = Number(params.product_id);
  let count = Number(params.count) || 5;
  let page = Number(params.page) || 0;
  let sort = params.sort || 'relevant';
  //need to figure out the sorting, change date structure
  var startNumber;
  if (params.count && params.page == 0) {
    startNumber = 0;
  } else if (params.count && params.page) {
    startNumber = count * page;
  } else {
    startNumber = 0;
  }

  reviewsCollection.find({ "product_id": product_id }).toArray()
    .then((results) => {
      let sortedResults = results;
      let reviewsStructure = {
        product: '',
        page: 0,
        count: 0,
        results: []
      }

      if (sort === 'newest') {
        sortedResults = results.sort((a, b) => (a.date - b.date)
        )
      } else if (sort === 'helpful') {
        sortedResults = results.sort((a, b) => (b.helpfulness - a.helpfulness))
      }
      for (var review in sortedResults) {
        let longTime = new Date(sortedResults[review].date).toISOString();
        sortedResults[review].date = longTime;
      }
      reviewsStructure.product = results[0].product_id.toString();
      reviewsStructure.page = page;
      reviewsStructure.count = results.length;
      reviewsStructure.results.push(sortedResults.slice(startNumber, startNumber + count));

      cb(null, reviewsStructure)
    })
    .catch((err) => {
      cb(err, null)
    })

}


function close() {
  mongodb.close();
}

module.exports = {
  connect,
  get,
  close
};




// const { MongoClient } = require('mongodb');
// const config = require('./../config.js');

// // Replace the uri string with your MongoDB deployment's connection string.
// const uri = 'mongodb://localhost/27017';
// const dbName = 'SDC';
// const client = new MongoClient(uri);
// let reviewsCollection;
// let metaReviewsCollection;
// let db;

// async function run() {
//   try {
//     await client.connect();
//     db = client.db(dbName);
//     reviewsCollection = db.collection('merged_reviews');
//     reviewsCollection = db.collection('reviews_characteristics_merged');

//   //place queries here
//     // await testing.forEach((doc) => {
//     //   if (doc.id == 5) {
//     //     console.dir(doc)
//     //   }
//     // });

//   } finally {
//     await client.close();
//   }
// }
// run().catch(console.dir);

// module.exports.db = db;
// module.exports.connect = run;
// module.exports.client = client;
// module.exports.reviewsCollection = reviewsCollection;
// module.exports.metaReviewsCollection = metaReviewsCollection;