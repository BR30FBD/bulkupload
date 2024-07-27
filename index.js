var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const cors = require('cors');
var mongoose = require('mongoose');
var multer = require('multer');
var csv = require('csvtojson');
// require('dotenv/config');
var upload = multer({ dest: 'uploads/' });
var BulkUpload = require('./model');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
  BulkUpload.find({}, (err, items) => {
    if (err) {
      console.log(err);
    }
    else {
      res.json({ items: items });
    }
  });
});
app.post('/', upload.single('file'), (req, res, next) => {
  csv()
    .fromFile(req.file.path)
    .then((jsonObj) => {
      var Bulk = [];
      for (var i = 0; i < jsonObj.length; i++) {
        var obj = {};
        obj.category = jsonObj[i]['category'];
        obj.subCategory = jsonObj[i]['subCategory'];
        obj.image = jsonObj[i]['image'];
        obj.status = jsonObj[i]['status'];
        Bulk.push(obj);
      }
      res.status(200).send({
        message: "Successfully Uploaded!",
        data: Bulk
      });
      BulkUpload.insertMany(Bulk).then(function () {
        res.status(200).send({
          message: "Successfully Uploaded!"
        });
      }).catch(function (error) {
        res.status(500).send({
          message: "failure",
          error
        });
      });
    }).catch((error) => {
      res.status(500).send({
        message: "failure",
        error
      });
    })
});
mongoose.connect('mongodb://localhost:27017/bulkupload',
  { useUnifiedTopology: true }, err => {
    console.log('Connected to database!')
  });
app.listen('3000' || process.env.PORT, err => {
  if (err)
    throw err
  console.log('Server started!')
});