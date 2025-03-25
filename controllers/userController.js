const prisma = require("../prisma/prisma");
const passport = require("../authentication/passportConfig");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../middleware/asyncHandler");
const { body, validationResult } = require("express-validator");

const signUpValidator = [
    body("firstName")
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage("First Name must be between 1 and 30 characters.")
        .isAlpha()
        .withMessage("First name must only contain letters."),
    body("lastName")
        .trim()
        .isLength({ min: 1, max: 40 })
        .withMessage("Last Name must be between 1 and 40 characters.")
        .isAlpha()
        .withMessage("Last name must only contain letters."),
    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required.")
        .custom(async (value) => {
            const isInUse = await prisma.user.findFirst({
                where: {
                    username: value,
                },
            });
            if (isInUse) {
                throw new Error("Username already in use.");
            }
        }),
    body("password")
        .isLength({ min: 5, max: 255 })
        .withMessage("Password must be between 5 and 255 characters."),
    body("confirmPassword")
        .custom((value, { req }) => {
            return value === req.body.password;
        })
        .withMessage("Password fields must match."),
];

const logInValidator = [
    body("username").trim().notEmpty().withMessage("Username is required."),
    body("password").isLength({ min: 1 }).withMessage("Password is required."),
];

const logInPost = [
    logInValidator,
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty) {
            return res.status(400).render("index", { errors: errors.array() });
        }
        next();
    },
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/",
        failureMessage: true,
    }),
];

function logOutGet(req, res) {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
}

function signUpGet(req, res) {
    res.render("sign-up-form");
}

const signUpPost = [
    signUpValidator,
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).render("sign-up-form", {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                username: req.body.username,
                errors: errors.array(),
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        await prisma.user.create({
            data: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                username: req.body.username,
                password: hashedPassword,
            },
        });

        next();
    }),
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/",
        failureMessage: true,
    }),
];

module.exports = {
    logInPost,
    logOutGet,
    signUpGet,
    signUpPost,
};
