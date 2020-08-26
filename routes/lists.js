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
        const movies = await Movie.find({ list: list.id }).limit(5).exec()
        res.render('lists/show', {
            list: list,
            moviesInList: movies
        })
    } catch {
        res.redirect('/')
    }
})

// Edit list
router.get('/:id/edit', async (req, res) => {
    try {
        const list = await List.findById(req.params.id)
        res.render('lists/edit', { list: list })
    } catch {
        res.redirect('/lists')
    }
})

// Update edited list
router.put('/:id', async (req, res) => {
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
            res.render('lists/edit', {
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