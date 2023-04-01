const express = require("express");
const { open } = require("sqlite"); //used to open connection to database from the server
const sqlite3 = require("sqlite3"); //driver class is in sqlite3
const path = require("path");
const app = express();
//middleware -  express.json() is used to recognize the incoming request object as JSON Object and parses it.
//Before information is sent to an API some preprocessing is done in middleware
app.use(express.json());

const dbPath = path.join(__dirname, "goodreads.db");
let db = null;
//connect to the database and server from NodeJS
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API to get all the books
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT * FROM book ORDER BY book_id;
    `;
  const booksArray = await db.all(getBooksQuery); //db.all returns a promise object //all is a method to execute sql query from node JS. It is used when we need multiple rows as output
  //sqlite provides different methods to execute the sql queries from nodeJS
  response.send(booksArray);
});

//API to get a particular book
app.get("/books/:bookId/", async (request, response) => {
  //request.params gets the query parameters from the url
  const { bookId } = request.params;
  //sql query to get a particular book
  const getBookQuery = `
    SELECT * FROM book WHERE book_id = ${bookId};
    `;
  //get is used when only one row is in the output
  const book = await db.get(getBookQuery);
  response.send(book);
});

//API to post a particular book
app.post("/books/", async (request, response) => {
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;
  const dbResponse = await db.run(addBookQuery);
  const bookId = dbResponse.lastID;
  response.send({ bookId: bookId });
});

//API to update a book
app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;
  await db.run(updateBookQuery);
  response.send("Book updated successfully!");
});

//API to delete a book
app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const deleteBookQuery = `
    DELETE FROM
        book
    WHERE
        book_id = ${bookId};`;
  await db.run(deleteBookQuery);
  response.send("Book Deleted Successfully!");
});

//API to get a book of particular author
app.get("/authors/:authorID/books/", async (request, response) => {
  const { authorID } = request.params;
  const getAuthorsBookQuery = `
    SELECT * FROM book where author_id = ${authorID};
    `;
  const books = await db.all(getAuthorsBookQuery);
  response.send(books);
});
