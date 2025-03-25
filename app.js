const express = require("express");
const expressSession = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const prisma = require("./prisma/prisma");
require("dotenv").config();
const path = require("node:path");
const passport = require("./authentication/passportConfig");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
    expressSession({
        cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000, // ms
        },
        secret: process.env.SECRET,
        resave: true,
        saveUninitialized: true,
        store: new PrismaSessionStore(prisma, {
            checkPeriod: 2 * 60 * 1000, //ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }),
    })
);

app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.errorMessages = req.session.messages || [];
    req.session.messages = [];
    next();
});

const userRouter = require("./routes/userRouter");
const uploadRouter = require("./routes/uploadRouter");

// to delete below
async function testUsers() {
    const allUsers = await prisma.user.findMany();
    console.log(allUsers);
}

testUsers();
// to delete above

app.use("/user", userRouter);

app.use("/upload-file", uploadRouter);

app.use("/", (req, res) => {
    res.render("index");
});

app.use("*", (req, res) => {
    res.status(404).render("errorPage", {
        title: "Error",
        message: "This page doesn't exist.",
        error: process.env.NODE_ENV === "production" ? {} : err,
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(err.status || 500);

    res.render("errorPage", {
        title: "Error",
        message: "Something went wrong! Please try again later.",
        error: process.env.NODE_ENV === "production" ? {} : err,
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "::", () => {
    console.log(`Up and listening on PORT: ${PORT}`);
});
