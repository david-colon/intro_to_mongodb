const express = require('express');
const Promotion = require('../models/promotion');
const authenticate = require('../authenticate')
const promotionRouter = express.Router();
const cors = require('./cors');

promotionRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Promotion.find()
            .then(promotions => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotions);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Promotion.create(req.body)
            .then(promotion => {
                console.log('Promotion Created ', promotion);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /promotions');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Promotion.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

promotionRouter.route('/:promotionId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Promotion.findById(req.params.promotionId)
            .then(promotion => {
                if (promotion) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(promotion);
                } else {
                    err = new Error(`Promotion ${req.params.promotionId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Promotion.findById(req.params.promotionId)
            .then(promotion => {
                if (promotion) {
                    promotion.comments.push(req.body);
                    promotion.save()
                        .then(promotion => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(promotion);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Promotion ${req.params.promotionId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Promotion.findById(req.params.promotionId)
            .then(promotion => {
                if (promotion) {
                    if (req.body.name) {
                        promotion.name = req.body.name;
                    }
                    if (req.body.image) {
                        promotion.image = req.body.image;
                    }
                    if (req.body.featured) {
                        promotion.featured = req.body.featured;
                    }
                    if (req.body.cost) {
                        promotion.cost = req.body.cost;
                    }
                    if (req.body.description) {
                        promotion.description = req.body.description;
                    }
                    promotion.save()
                        .then(promotion => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(promotion);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Promotion ${req.params.promotionId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Promotion.findById(req.params.promotionId)
            .then(promotion => {
                if (promotion) {
                    // for (let i = (promotion.length - 1); i >= 0; i--) {
                    //     promotionid(promotion[i]._id).remove();
                    // }
                    // promotion.save()
                    promotion.remove()
                        .then(promotion => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(promotion);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Promotion ${req.params.promotionId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });

module.exports = promotionRouter;