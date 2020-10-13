const express = require('express')
const Movie = require('../models/movie')
const List = require('../models/list')
const router = express.Router()

router.get('/', async (req, res) => {
    const recentlyAddedMovies = await Movie.find({}).sort({ _id: -1 }).limit(10).exec() 
    res.render('index', { recentlyAddedMovies: recentlyAddedMovies })
})

module.exports = router