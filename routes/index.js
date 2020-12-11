const express = require("express");
const router = express.Router();
const user = require("../models/user");
const purchase = require("../models/purchase");
const passport = require("passport");
const middleware = require("../middleware");
const FroalaEditor = require('../node_modules/wysiwyg-editor-node-sdk/lib/froalaEditor.js');
const aws = require('aws-sdk');
const pjson = require('../package.json');
const slugify = require("slugify");
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const session = require('express-session');
const crypt = require('bcrypt-nodejs');
const async = require('async');
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
const xoauth2 = require('xoauth2');
const jsonfile = require('jsonfile')

function toProperCase() {
    return this.replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}

// Category JSON
const siteMap = './json/site-map.json';
var JSONcategories;

jsonfile.readFile(siteMap, function(err, obj) {
    if (obj) {
        JSONcategories = obj;
    }
});

// Environment
const host = process.env.HOST;
const port = process.env.PORT;
const email_user = process.env.EMAIL_USER; // Nodemailer Email
const email_password = process.env.EMAIL_PASSWORD; // Nodemailer

function firstname(req) {
    if (req.user.username) {
        var firstname = req.user.username.substr(0, req.user.username.indexOf('.'))
        return firstname;
    }
}

// ROOT middleware.isLoggedIn,
router.get("/", function(req, res) {
    res.render("index", {
        version: pjson.version,
        user: req.user
    });
});


router.get("/courses", function(req, res) {
    res.render("courses", {
        version: pjson.version,
        user: false,
        user: req.user
    });
});

router.get("/courses/:course", function(req, res) {
    res.render("course-page", {
        version: pjson.version,
        user: req.user,
        course_title: req.params.course
    });
});



// PURCHASE ROUTES
router.get("/check", function(req, res) {
    res.render("check", {
        version: pjson.version,
        user: req.user
    });
});


router.post("/check", function(req, res) {

    var userType = req.body.userType;
    var dob = req.body.dob;
    var country_selector_code = req.body.country_selector_code;

    var check = {
        userType: userType,
        dob: dob,
        country: country_selector_code,
    }

    // Create a new purchase order (stage 1, check) and save to DB
    purchase.create(check, function(err, newCheck) {
        if (err) {
            console.log(err);
        } else {
            res.render("purchase", {
                checkID: newCheck._id,
                version: pjson.version,
                user: req.user
            });
        }
    });
});


router.post("/purchase", function(req, res) {

    var checkID = req.body.checkID;

    var purchaseInfo = {
            name_on_card: req.body.name_on_card,
            card_number: req.body.card_number,
            expiry: req.body.expiry,
            email1: req.body.email1,
            promo: req.body.promo,
            course: req.body.course
        }
        // Update the existing purchase record with information
    purchase.findOneAndUpdate({ _id: checkID }, purchaseInfo, { new: true }, function(err, completePurchase) {
        if (err) {
            req.flash("error", "Couldn't update page");
            res.redirect("/error");

        } else {
            res.render("confirmation", {
                version: pjson.version,
                user: req.user,
                completePurchase: completePurchase
            });
        }
    });

});

// CONFIRMATION ROUTES

router.get("/confirmation", function(req, res) {
    res.redirect("confirmation", {
        version: pjson.version,
        user: req.user
    });
});


// REGISTER ROUTES
router.get("/register", function(req, res) {
    res.render("register", {
        version: pjson.version,
        user: req.user,
        purchaseID: req.query.id
    });
});

router.post("/register", function(req, res, next) {

    var newUser = new user({
        // Email
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password1,
        gender: req.body.gender,
        purchaseID: req.body.purchaseID
    });

    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            user.findOne({
                username: newUser.username
            }, function(err, user) {

                if (user) {
                    console.log('User already exists');
                    res.render("login", {
                        version: pjson.version,
                        errorEmail: req.body.username,
                        errorMessage: null,
                        purchaseID: req.body.purchaseID
                    });
                } else {
                    console.log('New user created');
                    newUser.loginToken = token;
                    newUser.loginTokenExpires = Date.now() + 3600000; // 1 hour

                    newUser.save(function(err) {
                        done(err, token, user);
                    });

                    var smtpTransport = nodemailer.createTransport({
                        service: 'gmail',
                        host: 'smtp.gmail.com',
                        auth: {
                            user: email_user,
                            pass: email_password
                        }
                    });
                    var mailOptions = {
                        to: newUser.username,
                        from: 'hello@uxjay.com',
                        subject: 'Welcome to EtonX!.',
                        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                            'Please click on the following link, or paste this into your browser to login to your dashboard:\n\n' +
                            'http://' + req.headers.host + '/dashboard/' + token + '\n\n'
                    };
                    smtpTransport.sendMail(mailOptions, function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });

        }
    ], function(err, done) {
        if (err) {} else {
            res.render("checkEmail", {
                version: pjson.version,
                successEmail: newUser.username,
                purchaseID: req.body.purchaseID
            });
        }

    });
});

// DASHBOARD ROUTES

router.get("/dashboard", middleware.isLoggedIn, function(req, res) {
    res.render("dashboard", {
        version: pjson.version,
        user: req.user
    });
});


router.get('/dashboard/:token', function(req, res) {
    user.findOne({
        loginToken: req.params.token,
        loginTokenExpires: {
            $gt: Date.now()
        }
    }, function(err, user) {
        if (!user) {
            return res.redirect('/login');
        }
        req.logIn(user, function(err) {
            if (err) {
                console.log(err)
            } else {
                res.render('dashboard', {
                    version: pjson.version,
                    user: user
                });
            }
        });

    });
});

// LOGIN ROUTES
router.get("/login", function(req, res) {
    res.render("login", {
        user: req.user,
        version: pjson.version,
        errorEmail: null,
        errorMessage: null
    });
});

// LOGIN ROUTES
router.get("/access-code", function(req, res) {
    res.render("access", {
        user: req.user,
        version: pjson.version,
        accessCode: req.query.accessCode,
        institution: req.query.institution
    });
});

router.post('/login', function(req, res, next) {

    passport.authenticate('local', {

        failureFlash: true

    }, function(err, user, info) {

        if (err) return next(err)
        if (!user) {
            return res.render("login", {
                user: req.user,
                version: pjson.version,
                errorEmail: null,
                errorMessage: info.message
            });
        }
        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.redirect('/dashboard/');
        });
    })(req, res, next);
});

// LOGOUT ROUTE
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

// FORGOT PASSWORD ROUTES
router.get("/forgot", function(req, res) {
    res.render("forgot", {
        version: pjson.version,
        admin: false,
        user: req.user,
    });
});

router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            user.findOne({
                username: req.body.username
            }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                auth: {
                    user: email_user,
                    pass: email_password
                }
            });
            var mailOptions = {
                to: user.username,
                from: 'hello@kaiserbear.co.uk',
                subject: 'UXNOTHS: Password Reset.',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'We\'ve sent an email to ' + user.username);
                    done();
                }
            });
        }
    ], function(err, done) {
        if (err) {} else {
            res.redirect('/forgot');
            done();
        }

    });
});

// RESET ROUTES
router.get('/reset/:token', function(req, res) {
    user.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gte: Date.now()
        }
    }, function(err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', {
            admin: false,
            user: req.user,
            version: pjson.version
        });
    });
});

router.post('/reset/:token', function(req, res) {
    async.waterfall([

        function(done) {
            user.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    $gte: Date.now()
                }
            }, function(err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }

                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                    req.logIn(user, function(err) {
                        if (err) {
                            console.log(err)
                        } else {
                            req.flash('success', 'Password changed for ' + user.username);
                            done(user);
                        }
                    });
                });
            });
        },

        function(user, done) {

            var smtpTransport = nodemailer.createTransport('SMTP', {
                service: 'gmail',
                host: 'smtp.gmail.com',
                auth: {
                    user: email_user,
                    pass: email_password
                }
            });
            var mailOptions = {
                to: user.username,
                from: 'hello@kaiserbear.co.uk',
                subject: 'UXNOTHS: your password has been changed.',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.username + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                if (err) {
                    console.log(err)
                } else {
                    req.flash('success', 'Success! Your password has been changed.');
                    done(user);
                }
            });
        }
    ], function(err) {
        res.redirect('/');
    });
});

router.get('/sign-s3', (req, res) => {

    // S3 Bucket Config
    const s3 = new aws.S3();
    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];
    const s3Params = {
        Bucket: S3_BUCKET,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
    };
    console.log(aws.config);
    aws.config.region = 'eu-west-2';
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) {
            console.log(err);
            return res.end();
        }
        const returnData = {
            signedRequest: data,
            url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
        };
        res.write(JSON.stringify(returnData));
        console.log(returnData);
        res.end();
    });
});


// Upload Image S3 Token generator.
router.get('/upload_image', middleware.isLoggedIn, function(req, res) {
    // Froala S3 Set Up
    var configs = {
        bucket: process.env.S3_BUCKET,
        region: 'eu-west-2',
        keyStart: 'uploads',
        acl: 'public-read',
        accessKey: process.env.AWS_ACCESS_KEY_ID,
        secretKey: process.env.AWS_SECRET_ACCESS_KEY
    }
    var s3Hash = FroalaEditor.S3.getHash(configs);
    res.send(s3Hash);
});

router.get('/get_bucket_list', middleware.isLoggedIn, (req, res) => {

    // S3 Bucket Config
    const s3 = new aws.S3();
    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];
    const s3Params = {
        Bucket: process.env.S3_BUCKET
    };
    aws.config.region = 'eu-west-2';
    s3.listObjects(s3Params, function(err, data) {
        if (err) throw err;
        res.send(data.Contents);
    });
});


module.exports = router;