const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new mongoose.Schema(
    {

    },
    {
        timestamps: true,
    }
);

productSchema.plugin(mongoosePaginate);
const Product = mongoose.model("Product", productSchema, "products");
module.exports = Product;
