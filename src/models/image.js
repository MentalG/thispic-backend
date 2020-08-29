const mongoose = require('mongoose');

const ImageSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    postImage: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('Post', ImageSchema)