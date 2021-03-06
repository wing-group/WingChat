var User = require('../models/user');
var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
    User.findOne({username : req.body.username}, function(err, user) {
        if(user) {
            user.comparePassword(req.body.password, function(err, isMatch) {
                if(err) {
                    console.log(err);
                }
                if(isMatch) {
                    req.session.user = user;
                    req.session.save();
                    exports.getUsers(function(users) {
                        res.redirect('/chat');
                    });
                    req.session.user = user;
                    req.session.save();
                } else {
                    res.render('index', {errmsg: 'Username or password were incorrect'})
                }
            });
        } else {
            res.render('index', {errmsg: 'Username or password were incorrect'});
        }
    });
});

router.get('/chat', function(req, res) {
    if(req.session.user) {
        exports.getUsers(function(users) {
            res.render('chat', {fellas: users, username: req.session.user.username});
        });
    } else {
        res.render('index');
    }
});

router.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
});

router.post('/register', function(req, res) {
    if( req.body.firstname &&
        req.body.lastname &&
        req.body.username &&
        req.body.password ) {

        User.find({username : req.body.username}, function(err, users) {
            if(!req.body.username.includes(' ')) {
                if(users.length == 0) {
                    var user = new User({
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        username: req.body.username,
                        password: req.body.password,
                        wings: 100
                    });
                    user.save(function(err) {
                        res.redirect('/');
                    });
                } else {
                    res.render('register', {errmsg : 'Username already exists'})
                }
            } else {
                res.render('register', {errmsg : 'Illegal character in username'})
            }
        });
    }
});

exports.getUsers = function(cb) {
    User.find({}, function(err, users) {
        cb(users);
    });
}

exports.giveAllFellasWingBalance = function() {
    User.find({}, function(err, users) {
        users.forEach(function(user){
            if(!user.wings) {
                user.wings = 0;
                user.save();
            }
        });
    });
}

module.exports = router;