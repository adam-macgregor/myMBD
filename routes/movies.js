const express = require('express')
const router = express.Router()
const Movie = require('../models/movie')
const List = require('../models/list')

// All movies
router.get('/', async (req, res) => {
    let searchOptions = {}
    if(req.query.title != null && req.query.title !== ''){
        searchOptions.title = new RegExp(req.query.title, 'i')
    }
    if(req.query.director != null && req.query.director !== ''){
        searchOptions.director = new RegExp(req.query.director, 'i')
    }
    if(req.query.genre != null && req.query.genre !== ''){
        searchOptions.genre = new RegExp(req.query.genre, 'i')
    }
    /* if(req.query.releasedAfter != null && req.query.releasedAfter !== ''){
        searchOptions.releasedAfter = new RegExp(req.query.tireleasedAftertle, 'i')
    }if(req.query.releasedBefore != null && req.query.releasedBefore !== ''){
        searchOptions.releasedBefore = new RegExp(req.query.releasedBefore, 'i')
    } */
    try {
        const movies = await Movie.find(searchOptions)
        const lists = await List.find({})
        res.render('movies/index', { 
            movies: movies, 
            lists: lists,
            searchOptions: req.query 
        })
    } catch {
        res.redirect('/')
    }
})

// New movie
router.get('/new', async (req, res) => {
    try{
        const lists = await List.find({})
        res.render('movies/new', { movie: new Movie(), lists: lists})
    } catch {
        res.redirect('/')
    }
})

//Create new movie
router.post('/', async (req, res) => {
    const movie = new Movie({
        title: req.body.title,
        director: req.body.director,
        genre: req.body.genre,
        releaseDate: req.body.releaseDate,
        imageUrl: req.body.imageUrl,
        summary: req.body.summary,
        list: req.body.list
    })

    try {
        const newMovie = await movie.save()
        res.redirect(`movies/${newMovie.id}`)
    } catch (e) {
        res.render('movies/new', {
            movie: movie,
            errorMessage: 'Error creating movie'
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id)
                                        .populate('list')
                                        .exec()
        res.render('movies/show', { movie: movie })                    
    } catch {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id)
        const lists = await List.find({})
        res.render('movies/edit', { movie: movie, lists: lists })                    
    } catch {
        res.redirect('/')
    }
})

router.put('/:id', async (req, res) => {
    let movie 
    try {
        movie = await Movie.findById(req.params.id)
        movie.title = req.body.title
        movie.director = req.body.director
        movie.genre = req.body.genre
        movie.releaseDate = req.body.releaseDate
        movie.imageUrl = req.body.imageUrl
        movie.summary = req.body.summary
        movie.list = req.body.list
        await movie.save()
        res.redirect(`/movies/${movie.id}`)
    } catch (e) {
        console.log(e)
        if(movie != null) {
            res.render(`movies/${movie.id}/edit`)
        } else {
            res.render('movies/new', {
                movie: movie,
                errorMessage: 'Error creating movie'
            })
        }
    }
})

router.delete('/:id', async (req, res) => {
    let movie
    try {
        movie = await Movie.findById(req.params.id)
        await movie.remove()
        res.redirect('/movies')
    } catch {
        if(movie == null) {
            res.redirect('/')
        } else {
            res.redirect(`/movies/${movie.id}`)
        } 
    }
})

module.exports = router