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
    }
})

listSchema.pre('remove', function(next) {
    Movie.find({ list: this.id }, (err, movies) => {
        if(err) {
            next(err)
        } else if(movies.length > 0) {
            next(new Error('This list has movies still'))
        } else {
            next()
        }
    })
})

module.exports = mongoose.model('List', listSchema)