var mongoose = require('mongoose');
var BulkUpload = new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  subCategory: [{ type: String, required: false }],
  image: { type: String, required: true },
  status: { type: Number, default: 1 },
});
module.exports = new mongoose.model('bulkupload', BulkUpload);