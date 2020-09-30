const mongoose = require('mongoose')
const Movie = require('./movie')

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    movies: {
        type: [mongoose.Schema.Types.ObjectId],
        required: false,
        ref: 'Movie'
    }
})

module.exports = mongoose.model('List', listSchema)