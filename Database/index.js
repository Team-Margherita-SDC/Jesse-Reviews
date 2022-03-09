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
async function getReviews(params, cb) {
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

const characteristicsBuilder = function (allCharReviews) {
  let charDetailsContainer = {};
  let noNameChar = [];

  allCharReviews.forEach((oneCharReview)=>{
    //the front end didnt provide character name on new review submission
    let charName;
    if (!oneCharReview.name) {
      noNameChar.push(oneCharReview);
    }
    if (!charDetailsContainer[oneCharReview.name]) {
      charDetailsContainer[oneCharReview.name] = {
        id: oneCharReview.characteristic_id,
        value: oneCharReview.value,
        count: 1
      }
    } else {
      charDetailsContainer[oneCharReview.name].value += oneCharReview.value;
      charDetailsContainer[oneCharReview.name].count++
    }
  })

  if (noNameChar.length > 0) {
    noNameChar.forEach((oneNoNameChar)=> {
      let id = oneNoNameChar.id;
      for (var key in charDetailsContainer) {
        if (charDetailsContainer[key].id === id) {
          charDetailsContainer[key].value += oneNoNameChar.value;
          charDetailsContainer[key].count ++
        }
      }
    })
  }
  for (var characteristic in charDetailsContainer) {
    charDetailsContainer[characteristic].value = (charDetailsContainer[characteristic].value / charDetailsContainer[characteristic].count).toString();
    delete charDetailsContainer[characteristic].count;
  }
  return charDetailsContainer
}

async function getMetaReviews(params, cb) {
  let product_id = Number(params.product_id);
  let reviewsMetaStructure = {
    product_id: 0,
    ratings: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    },
    recommended: {
      false: 0,
      true: 0
    },
    characteristics: {
    }
  }

  metaReviewsCollection.find({ "product_id": product_id }).toArray()
    .then((results) => {
      let allCharReviews = [];
      reviewsMetaStructure.product_id = product_id.toString();
      results.forEach((oneReview) => {
        if (oneReview.reported === 'false' || oneReview.reported === false) {
          let ratingKey = oneReview.rating.toString();
          reviewsMetaStructure.ratings[ratingKey]++;
          reviewsMetaStructure.recommended[oneReview.recommend] ++;
          oneReview.characteristic_reviews.forEach((oneCharReview)=>{
            allCharReviews.push(oneCharReview)
          })
        }
      })
      for (var numRating in reviewsMetaStructure.ratings) {
        reviewsMetaStructure.ratings[numRating] = reviewsMetaStructure.ratings[numRating].toString()
      }
      reviewsMetaStructure.characteristics = characteristicsBuilder(allCharReviews)
      cb(null, reviewsMetaStructure)
    })
    .catch((err) => {
      cb(err, null)
    })
}

async function addReview(params, cb) {
  let defaultproductid = params.product_id;
  let defaultrating = Number(params.rating) || null;
  let defaultsummary = params.summary || null;
  let defaultbody = params.body || null;
  let defaultrecommend = params.recommend || null;
  let defaultname = params.name || null;
  let defaultemail = params.email || null;
  let defaultphotos = params.photos || null;
  let defaultcharacteristics = params.characteristics || null;
  let nextReviewID;
  let defaultnewReviewContainer = {
    id: nextReviewID,
    product_id: Number(defaultproductid),
    rating: defaultrating,
    date: Date.now(),
    summary: defaultsummary,
    body: defaultbody,
    recommend: defaultrecommend,
    reported: false,
    reviewer_name: defaultname,
    reviewer_email: defaultemail,
    photos: defaultphotos
  }
  let newMetaReviewContainer = {
    id: nextReviewID,
    product_id: Number(defaultproductid),
    rating: defaultrating,
    recommend: defaultrecommend,
    reported: false,
    characteristic_reviews: []
  }

  reviewsCollection.find({}).sort({id: -1}).limit(1).toArray()
  .then((results)=>{
    nextReviewID = results[0].id + 1;
    defaultnewReviewContainer.id = nextReviewID;
    newMetaReviewContainer.id = nextReviewID;
  })
  .then(()=>{
    reviewsCollection.insertOne(defaultnewReviewContainer)
    .then((result)=>{
      metaReviewsCollection.insertOne(newMetaReviewContainer)
      .then((results)=> {
        cb(null, results)
      })
      .catch((err)=>{
        cb(err, null)
      })
    })
    .catch((err)=>{
      cb(err, null)
    })
  })
  .catch((err)=> {
    cb(err, null)
  })

  const characteristicBuilder = function(reviewID, charID, charValue) {
    let newCharacteristicReview = {
      id: reviewID,
      characteristic_id: charID,
      value: charValue,
      name: null
    }
    newMetaReviewContainer.characteristic_reviews.push(newCharacteristicReview)
  }

  if (defaultcharacteristics) {
    for (var key in defaultcharacteristics) {
      let currentCharacteristicID = key;
      let currentCharacteristicValue = defaultcharacteristics[key];
      characteristicBuilder(nextReviewID, currentCharacteristicID, currentCharacteristicValue)
    }
  }
}

async function addHelpful(params, cb) {
  let reviewID = Number(params.review_id);
  reviewsCollection.updateOne({ "id": reviewID}, {$inc: {helpfulness: 1}}, {upsert: true})
    .then((results) => {
      cb(null, results)
    })
    .catch((err) => {
      cb(err, null)
    })
}

async function reportReview(params, cb) {
  let reviewID = Number(params.review_id);
  reviewsCollection.updateOne({ "id": reviewID}, {$set: {reported: true}}, {upsert: true})
    .then((results) => {
      cb(null, results)
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
  getReviews,
  getMetaReviews,
  close,
  addReview,
  addHelpful,
  reportReview
};



