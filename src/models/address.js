const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const addressSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    building_name:{
        type:String,
        required: false,
    },
    street:{
        type:String,
        required: false,
    },
    area:{
        type:String,
        required: false,
    },
    address_line_1:{
        type:String,
        required: false,
    },
    address_line_2:{
        type:String,
        required: false,
    },
    location_coordinates:{
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
        type: [Number], 
        default: [0, 0]
        }
    },
    city: {
        type: Number,
        ref: 'City',
        required: true,
    },
    state: {
        type: Number,
        ref: 'State',
        required: true,
    },
    country: {
        type: Number,
        ref: 'Country',
        required: true,
    },
    postal_code: { 
        type: String,
        required: true,
    },
    country_code: {
        type: String,
        default: null,
    },
    contact_number: {
        type: String,
        required: false
    },
    address_type:{
        type: String,
        enum: ['shipping', 'billing', 'warehouse', 'office', 'profile', 'other'],
        default: 'shipping',
    },
    isPrimary: {
        type: Boolean,
        default: false,
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
}) ;

addressSchema.plugin(mongoosePaginate);
const Address= mongoose.model('Address', addressSchema)
module.exports =Address;
