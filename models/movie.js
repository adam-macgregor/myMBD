const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    director: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    releaseDate: {
        type: Date,
        required: true
    },
    imageUrl: {
        type: String,
    },
    summary: {
        type: String
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    list: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'List'
    }
})

module.exports = mongoose.model('Movie', movieSchema)