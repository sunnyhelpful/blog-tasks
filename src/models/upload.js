const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const uploadSchema = new mongoose.Schema({
  uploadsable_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  uploadsable_type: {
    type: String,
    required: true,
  },
  file_path: {
    type: String,
    required: true,
  },
  original_file_name: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: false,
    comment: 'media type',
  },
  file_type: {
    type: String,
    required: false,
  },
  extension: {
    type: String,
    required: false,
  },
  orientation: {
    type: String,
    required: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  }
}, { timestamps: true });

uploadSchema.methods.getFileUrl = function() {
    const filePath = path.join(__dirname, '..', 'public', this.file_path);
    if (fs.existsSync(filePath)) {
        return `/storage/${this.file_path}`;
    }
    return '';
};

uploadSchema.methods.softDelete = async function() {
    this.deletedAt = new Date();
    await this.save();
};

const Upload = mongoose.model("Upload", uploadSchema);

module.exports = Upload;
