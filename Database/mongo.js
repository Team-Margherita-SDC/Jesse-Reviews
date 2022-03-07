//---------firstpart of connection code -----------
const { MongoClient } = require('mongodb');
const config = require('./../config.js');

// Replace the uri string with your MongoDB deployment's connection string.
const uri = 'mongodb://localhost/27017';
const dbName = 'SDC';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    const db = client.db(dbName);
 //---------end of first part of connection code ------

    //---------code for merging characteristics and characteristic reviews (4 steps) -------

    //------(step 2) runfirst: adding name field to characteristic_reviews and transferring name value from characteristics-----
    //(step 1) add new name field to characteristic_reviews_source via command line first
    // const characteristic_reviews = db.collection('characteristic_reviews');
    // const characteristics = db.collection('characteristics');
    // const testing = await characteristic_reviews.aggregate([
    //   {
    //     $lookup: {
    //       from: "characteristics",
    //       localField: "characteristic_id",
    //       foreignField: "id",
    //       as: "name"
    //     }
    //   },
    //   { $set: {
    //     name: {$arrayElemAt: ["$name.name", 0]}
    //   }
    //   }, { $out: "merged_characteristics" }
    // ]);
    //-------end of adding name field and transferring name value
    //end of code for merging characteristics and characteristic reviews

    //--------(step 3) code for merging reviews with characteristic_reviews
    // const reviews = db.collection('reviews_source');
    // const merged_characteristics = db.collection('merged_characteristics');
    // const testing = await reviews.aggregate([
    //   {
    //     $lookup: {
    //       from: "merged_characteristics",
    //       localField: "id",
    //       foreignField: "review_id",
    //       as: "characteristic_reviews"
    //     }
    //   },
    //   { $out: "reviews_characteristics_merged" }
    // ]);

    //--------end of code for merging reviews with characteristic_reviews
    //(step 4)Run the scripts that modify the reviews table to match characteristics

    //---------code for merging reviews and photos (step 5) ---------
    // const reviews = db.collection('reviews_source');
    // const photos = db.collection('reviews_photos');
    // const testing = await reviews.aggregate([
    //   {
    //     $lookup: {
    //       from: "reviews_photos",
    //       localField: "id",
    //       foreignField: "review_id",
    //       as: "photos"
    //     }
    //   },
    //   { $out: "merged_reviews" }
    // ]);
    //-----------end of code for merging reviews and photos ---------
    //--second part of connection code-------
    await testing.forEach((doc) => {
      if (doc.id == 5) {
        console.dir(doc)
      }
    });

  } finally {
    await client.close();
  }
}
run().catch(console.dir);
//--------end of connection code -------

//--------command line inputs ---------
//--------------------------------------
//commandline to add files:
// mongoimport --db=SDCtest --collection=reviews --type=csv --headerline --file=Data/mock_reviews.csv
// mongoimport --db=SDC --collection=reviews_photos --type=csv --headerline --file=Data/reviews_photos.csv
// mongoimport --db=SDC --collection=characteristics --type=csv --headerline --file=Data/characteristics.csv
// mongoimport --db=SDC --collection=characteristic_reviews --type=csv --headerline --file=Data/characteristic_reviews.csv

//type 'mongo' in the command line to switch to mongodb shell. allows access to the db/collections

//creating indexes on a duplicate key:
//db.reviews_characteristics_merged.createIndex({ "product_id": 1 }, {"unique": false})

//searching an indexed key and verifying it only searched the relevant files
//db.reviews.find( {"product_id":12}).explain("executionStats")

//search for multiple different ids
//db.reviews.find( {product_id:{$in: [12, 13]}}).explain("executionStats")

//gets all ids without duplicates
//db.reviews.distinct("product_id")

//rename a collection
// db.reviews.renameCollection("reviews_source")

//add a new field to all documents in a collection
// db.characteristic_reviews.update({},{$set:{"name":""}}, false, true)

//delete a field from all documents in a collection
//run all of these to correctly format the reviews/meta merged document (step 4 from)
// db.reviews_characteristics_merged.update({}, {$unset: {date:1}}, false, true);
// db.reviews_characteristics_merged.update({}, {$unset: {summary:1}}, false, true);
// db.reviews_characteristics_merged.update({}, {$unset: {body:1}}, false, true);
// db.reviews_characteristics_merged.update({}, {$unset: {reviewer_name:1}}, false, true);
// db.reviews_characteristics_merged.update({}, {$unset: {reviewer_email:1}}, false, true);
// db.reviews_characteristics_merged.update({}, {$unset: {response:1}}, false, true);
// db.reviews_characteristics_merged.update({}, {$unset: {helpfulness:1}}, false, true);



//**************** */
//4 files added to db.
// product_id in reviews is indexed.
// product_id in characteristics is indexed.
//**************** */