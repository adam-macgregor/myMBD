const express = require('express')
const Movie = require('../models/movie')
const List = require('../models/list')
const router = express.Router()

router.get('/', async (req, res) => {
    const lists = await List.find({})
    const movies = await Movie.find({})
    const recentlyAddedMovies = await Movie.find({}).sort({ _id: -1 }).limit(3).exec()

    res.render('index', { recentlyAddedMovies: recentlyAddedMovies, lists: lists, movies: movies })
})

module.exports = router