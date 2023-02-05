const express = require('express');
const authenticate = require('../authenticate')
const favoriteRouter = express.Router();
const cors = require('./cors');
const Favorite = require('../models/favorite')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('user')
            .populate('campsite')
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

        // first check the request is an array
        if (!Array.isArray(req.body)) {
            return res.status(400).send({ error: 'Request body must be an array' });
        }

        for (const element of req.body) {
            // then check if the array contains objects
            if (typeof element !== 'object') {
                return res.status(400).send({ error: 'Array elements must be objects' });
            }
            // then check if the objects contains a string property of "_id"   
            if (!element.hasOwnProperty('_id') || typeof element._id !== 'string') {
                return res.status(400).send({ error: 'Objects must have a string property "_id"' });
            }
        }

        // check if the user has an associated favorites document
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                // if user DOES NOT have a favorites document, create one
                if (!favorite) {
                    console.log(`favorite doc does not exist. creating for user id: ${req.user._id}`)

                    Favorite.create({ user: req.user._id, campsites: [] })

                    console.log('Favorite Created ', req.user._id);
                }

                // check which campsites they have already favorited
                req.body.forEach(newCampsite => {
                    let campsiteIds = favorite.campsites.map(campsite => campsite._id);
                    if (campsiteIds.includes(newCampsite._id)) {
                        console.log('campsite id already exists. remove from request body')
                    } else {
                        console.log('campsite id does not exist -- we are good to SEND IT')
                        favorite.campsites.push(newCampsite)
                    }
                })

                favorite.save()
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })

            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then(response => {
                res.statusCode = 200;
                if (response) {
                    res.setHeader('Content-Type', 'application/json');
                    res.json(response);
                } else {
                    res.setHeader('Content-Type', 'text/plan');
                    res.end('You do not have any favorites to delete');
                }
            })
            .catch(err => next(err));
    });

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('GET operation not supported');
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                // if user DOES NOT have a favorites document, create one
                if (!favorite) {
                    console.log(`favorite doc does not exist. creating for user id: ${req.user._id}`)
                    Favorite.create({ user: req.user._id, campsites: [] })
                    console.log('Favorite Created ', req.user._id);
                }

                // check if campsite is already favorited
                if (favorite.campsites.includes(req.params.campsiteId)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('That campsite is already in the list of favorites!')
                } else if (!ObjectId.isValid(req.params.campsiteId)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('Not a valid campsite ID! Double check for typos')
                } else {
                    console.log('campsite id does not exist -- we are good to SEND IT')
                    favorite.campsites.push(req.params.campsiteId)
                }

                favorite.save()
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (!favorite) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('No favorites to delete');
                } else {
                    favorite.campsites = favorite.campsites.filter(
                        campsite => campsite._id.toString() !== req.params.campsiteId
                    );
                    favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                }
            })
            .catch(err => next(err));
    });





module.exports = favoriteRouter;