const express = require('express');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY

const router = express.Router();

//Post create user
router.post('/create', (req, res) => {
        try {
            jwt.sign(req.body, secretKey, async (error, token) => {
            if (error) throw new Error(error);

            const user = new User({
                email: req.body.email,
                password: req.body.password
            })

            const isUnique = !(await User.find({ email: req.body.email })).length;
            
            if (isUnique) {
                await user.save()
            } else {
                throw new Error('Email like this is already taken')
            }
            
            res.json({token, message: {primary: `Registration success`, secondary: `Welcome here ${req.body.email}, now you can upload your own pictures`}, type: 'success'})
        })
        } catch (error) {
            res.send({message: {primary: `Registration failed`, secondary: error.toString()}, type: 'error'})
        }
});

//GET login user
router.get('/login', async (req, res) => {
    try {
        const isExist = !!(await User.find({ email: req.query.email, password: req.query.password })).length;
        
        if (!isExist) throw new Error('There was an error. We have tried to find you but did not succeed');

        jwt.sign(req.query, secretKey, async (err, token) => {
            if (err) throw new Error(err)

            res.send({token, message: {
                primary: 'Login success',
                secondary: `Welcome here ${req.query.email}, now you can upload your own pictures`
            }, type: 'success'})
        })
    } catch (error) {
        res.send({message: {
            primary: 'There is an error',
            secondary: error.toString()
        }, type: 'error'})
    }
})

module.exports = router;
