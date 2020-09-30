const express = require('express')
const router = express.Router()
const Movie = require('../models/movie')
const List = require('../models/list')

// All movies
router.get('/', async (req, res) => {
    let query = Movie.find()
    if(req.query.title != null && req.query.title !== ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.director != null && req.query.director !== ''){
        query = query.regex('director', new RegExp(req.query.director, 'i'))
    }
    if(req.query.genre != null && req.query.genre !== ''){
        query = query.regex('genre', new RegExp(req.query.genre, 'i'))
    }
    if(req.query.releasedAfter != null && req.query.releasedAfter !== ''){
        query = query.gte('releaseDate', req.query.releasedAfter)
    }
    if(req.query.releasedBefore != null && req.query.releasedBefore !== ''){
        query = query.lte('releaseDate', req.query.releasedBefore)
    }
    try {
        const movies = await query.exec()
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
        res.render('movies/new', { movie: new Movie() })
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
        summary: req.body.summary
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
    let query = Movie.find()
    try {
        const movie = await Movie.findById(req.params.id)
        const genres = await movie.genre.split(',')
        const genreRegEx = genres.map(genre => {
            return new RegExp(`${genre}`, 'i')
        })
        const moreByGenre = await Movie.find({genre: {$in: genreRegEx}, _id: {$ne: movie.id}})
        const moreByDirector = await Movie.find({director: movie.director, _id: {$ne: movie.id}})
        res.render('movies/show', { movie: movie, moreByDirector: moreByDirector, moreByGenre: moreByGenre })                    
    } catch {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id)
        res.render('movies/edit', { movie: movie })                    
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