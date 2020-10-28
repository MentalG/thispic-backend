const express = require('express');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY

const router = express.Router();

//Post create user
router.post('/create', (req, res) => {
    jwt.sign(req.body, secretKey, async (err, token) => {
        if (err) res.send(err);

        const user = new User({
            email: req.body.email,
            password: req.body.password
        })

        try {
            const isUnique = !(await User.find({ email: req.body.email })).length;

            isUnique ? await user.save() : res.json('Email like this is already taken')
        } catch (error) {
            res.send({ message: error })
        }

        res.json({token})
    })
});

//GET login user
router.get('/login', async (req, res) => {
    try {
        const isExist = !!(await User.find({ email: req.query.email, password: req.query.password })).length;
        
        if (!isExist) res.send({message : 'There is no user like this'})

        jwt.sign(req.query, secretKey, async (err, token) => {
            if (err) res.send(err)

            res.send({token})
        })
    } catch (error) {
        res.send({message: error})
    }
})

module.exports = router;
