const express = require("express");
const path = require("path");
const { Database } = require("sqlite3");
const sqlite3 = require("sqlite3").verbose();

// Creating Express
const app = express();

// Configuring the server
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/styles/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")));
app.use(express.urlencoded({ extended: false }));

// Setting up SQLite DB and connecting
const db_name = path.join(__dirname, "data", "apptest.db");
const db = new sqlite3.Database(db_name, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Successful connection to the database 'apptest.db'");
});

// Defining table scheme
const sql_create = `CREATE TABLE IF NOT EXISTS Notes (
    Note_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Note TEXT NOT NULL
  );`;

db.run(sql_create, err => {
    if (err) {
        return console.error(err.message); //this will be an error everytime at startup because table already created
    }
    console.log("Successful creation of the 'Notes' table"); //For first time setup
});

// Putting some default notes into table to get us started
const sql_insert = `INSERT INTO Notes (Note_ID, Note) VALUES
  (1, 'A very cool note'),
  (2, 'An even better note'),
  (3, 'And the best note!');`;
db.run(sql_insert, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Successful creation of 3 notes");
});


// Starting the server
app.listen(3000, () => {
    console.log("Server started (http://localhost:3000/).");
});


// Index router
app.get("/", (req, res) => {
    res.render("index");
});

// About router
app.get("/about", (req, res) => {
    res.render("about");
});

// Notes router
app.get("/notes", (req, res) => {
    const sql = "SELECT * FROM Notes ORDER BY Note_ID"
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        res.render("notes", { model: rows });
    });
});

// Edit router
app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Notes WHERE Note_ID = ?";
    db.get(sql, id, (err, row) => {
        // if (err) ...
        res.render("edit", { model: row });
    });
});

// Edit POST router
app.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const note = [req.body.Note_ID, req.body.Note, id];
    const sql = "UPDATE Notes SET Note_ID = ?, Note = ? WHERE (Note_ID = ?)";
    db.run(sql, note, err => {
        // if (err) ...
        res.redirect("/notes");
    });
});

// Create router
app.get("/create", (req, res) => {
    res.render("create", { model: {} });
});

// Create POST 
app.post("/create", (req, res) => {
    const sql = "INSERT INTO Notes (Note_ID, Note) VALUES (?, ?)";
    const note = [req.body.Note_ID, req.body.Note];
    db.run(sql, note, err => {
         if (err) {
            console.log("err")
         }
        res.redirect("/notes");
    });
});

// Delete router
app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Notes WHERE Note_ID = ?";
    db.get(sql, id, (err, row) => {
        // if (err) 
        res.render("delete", { model: row });
    });
});

// Delete POST
app.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM Notes WHERE Note_ID = ?";
    db.run(sql, id, err => {
        // if (err)
        res.redirect("/notes");
    });
});

// Search and return notes
// app.get("/notes/search/", (req, res) => {
//     const searchTerm = req.query.search;

//     //const category = req.query.category;

//         let query = 'SELECT * FROM Posting';

//         query = `SELECT * FROM Posting WHERE Name LIKE '%` + searchTerm
        
//         db.query(query) => {


    
    
    
    // const sql = "SELECT * FROM Notes ORDER BY Note_ID"
    // db.all(sql, [], (err, rows) => {
    //     if (err) {
    //         return console.error(err.message);
    //     }
    //     res.render("notes", { model: rows });
    // });
// });