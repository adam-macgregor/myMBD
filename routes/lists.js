const express = require('express')
const router = express.Router()
const List = require('../models/list')
const Movie = require('../models/movie')

// All lists
router.get('/', async (req, res) => {
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const lists = await List.find(searchOptions)
        res.render('lists/index', {
            lists: lists, 
            searchOptions: req.query 
        })
    } catch {
        res.redirect('/')
    }
})

// New list
router.get('/new', (req, res) => {
    res.render('lists/new', { list: new List() })
})

// Create new list
router.post('/', async (req, res) => {
    const list = new List({
        name: req.body.name
    })

    try {
        const newList = await list.save()
        res.redirect(`/lists/${list.id}`)
    } catch (e) {
        res.render('lists/new', {
            list: list,
            errorMessage: 'Error creating list'
        })
    }
})

// View list
router.get('/:id', async (req, res) => {
    try {
        const list = await List.findById(req.params.id)
        const movies = await Movie.find({_id: {$in: list.movies}})
        res.render('lists/show', {
            list: list,
            movies: movies
        })
    } catch {
        res.redirect('/')
    }
})

// Add/Remove movies
router.get('/:id/edit', async (req, res) => {
    try {
        const list = await List.findById(req.params.id)
        let query = Movie.find({_id: {$nin: list.movies}})
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
        let moviesInList = await Movie.find({_id: {$in: list.movies}})
        let moviesNotInList = await query.exec()
        res.render('lists/edit', { 
            list: list, 
            moviesInList: moviesInList, 
            moviesNotInList: moviesNotInList, 
            searchOptions: req.query 
        })
    } catch {
        res.redirect('/lists')
    }
})

// Update: Add movies to list
router.put('/:id/', async (req, res) => {
    let list
    try {
        list = await List.findById(req.params.id)
        if(req.body.movies != null || req.body.movies != undefined) {
            await list.updateOne({$push: {movies: req.body.movies}})
            res.redirect(`/lists/${list.id}/edit`)
        }
    } catch {
        if(list == null) {
            res.redirect('/')
        } else {
            res.render('lists/edit', {
                list: list,
                errorMessage: 'Error updating list'
            })
        } 
    }
})

// Update: Remove movies from list
router.put('/:id/remove', async (req, res) => {
    let list
    try {
        list = await List.findById(req.params.id)
        if(req.body.movies != null || req.body.movies != undefined) {
            await list.updateOne({$pull: {movies: {$in: req.body.movies}}})
            res.redirect(`/lists/${list.id}/edit`)
        }
    } catch {
        if(list == null) {
            res.redirect('/')
        } else {
            res.render('lists/edit', {
                list: list,
                errorMessage: 'Error updating list'
            })
        } 
    }
})

// Rename list get
router.get('/:id/rename', async (req, res) => {
    try {
        const list = await List.findById(req.params.id)
        res.render('lists/rename', { list: list })
    } catch {
        res.redirect('/lists')
    }
})


// Rename list put
router.put('/:id/rename', async (req, res) => {
    let list
    try {
        list = await List.findById(req.params.id)
        list.name = req.body.name
        await list.save()
        res.redirect(`/lists/${list.id}`)
    } catch {
        if(list == null) {
            res.redirect('/')
        } else {
            res.render('lists/rename', {
                list: list,
                errorMessage: 'Error updating list'
            })
        } 
    }
})

// Delete list
router.delete('/:id', async (req, res) => {
    let list
    try {
        list = await List.findById(req.params.id)
        await list.remove()
        res.redirect('/lists')
    } catch {
        if(list == null) {
            res.redirect('/')
        } else {
            res.redirect(`/lists/${list.id}`)
        } 
    }
})

module.exports = router