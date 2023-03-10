const express = require('express');
const Partner = require('../models/partner');
const authenticate = require('../authenticate')
const partnerRouter = express.Router();
const cors = require('./cors');

partnerRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Partner.find()
            .then(partners => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(partners);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Partner.create(req.body)
            .then(partner => {
                console.log('Partner Created ', partner);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(partner);
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /partners');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Partner.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

partnerRouter.route('/:partnerId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Partner.findById(req.params.partnerId)
            .then(partner => {
                if (partner) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(partner);
                } else {
                    err = new Error(`Partner ${req.params.partnerId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Partner.findById(req.params.partnerId)
            .then(partner => {
                if (partner) {
                    partner.comments.push(req.body);
                    partner.save()
                        .then(partner => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(partner);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Partner ${req.params.partnerId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Partner.findById(req.params.partnerId)
            .then(partner => {
                if (partner) {
                    if (req.body.name) {
                        partner.name = req.body.name;
                    }
                    if (req.body.image) {
                        partner.image = req.body.image;
                    }
                    if (req.body.featured) {
                        partner.featured = req.body.featured;
                    }
                    if (req.body.description) {
                        partner.description = req.body.description;
                    }
                    partner.save()
                        .then(partner => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(partner);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Partner ${req.params.partnerId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Partner.findById(req.params.partnerId)
            .then(partner => {
                if (partner) {
                    // for (let i = (partner.length - 1); i >= 0; i--) {
                    //     partner(partner[i]._id).remove();
                    // }
                    // partner.save()
                    partner.remove()
                        .then(partner => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(partner);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Partner ${req.params.partnerId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });

module.exports = partnerRouter;