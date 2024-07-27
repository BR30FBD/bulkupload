var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var mongoose = require('mongoose');
var multer = require('multer');
var csv = require('csvtojson');
require('dotenv/config');
var upload = multer({ dest: 'uploads/' });
var BulkUpload = require('./model');
var fs = require('fs');
var path = require('path');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  BulkUpload.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send({
        message: "Error fetching items",
        error: err
      });
    } else {
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

      BulkUpload.insertMany(Bulk).then(function () {
        res.status(200).send({
          message: "Successfully Uploaded!",
          data: Bulk
        });
      }).catch(function (error) {
        res.status(500).send({
          message: "Failure",
          error
        });
      });

      // Optionally remove the uploaded file after processing
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Failed to delete the file:", err);
        }
      });
    }).catch((error) => {
      res.status(500).send({
        message: "Failure",
        error
      });
    });
});

mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
  if (err) {
    console.error('Failed to connect to database:', err);
  } else {
    console.log('Connected to database!');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, err => {
  if (err) {
    throw err;
  }
  console.log(`Server started on port ${PORT}!`);
});
