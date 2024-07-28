const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader")
const packageDef = protoLoader.loadSync("books.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const bookPackage = grpcObject.bookPackage;

const server = new grpc.Server;

let books = [
  { id: '1', title: 'Note 1', author: "Munroe", content: 'Content 1'},
  { id: '2', title: 'Note 2', author: "Maxwell", content: 'Content 2'}
]

server.addService(bookPackage.Book.service,
  {
      "allBooks": allBooks,
      "createBook": createBook,
      "readBook": readBook,
      "updateBook": updateBook,
      "deleteBook": deleteBook
  });

function createBook (call, callback) {
  const book = call.request;
  book.id = books.length + 1;
  books.push(book);
  callback(null, { books });
}

function readBook (call, callback) {
  const book = books.find(n => n.id == call.request.id);

  if (book) {
      callback(null, book);
  } else {
      callback({
          code: grpc.status.NOT_FOUND,
          details: "Not found"
      });
  }
}

function updateBook (call, callback) {
  const existingBook = books.find(n => n.id == call.request.id);
  if (existingBook) {
      existingBook.title = call.request.title;
      existingBook.author = call.request.author;
      existingBook.content = call.request.content;
      callback(null, existingBook);
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
              details: "Not found"
        });
    }
}

function deleteBook (call, callback) {
  const existingBookIndex = books.findIndex((n) => n.id == call.request.id)
  if (existingBookIndex != -1) {
     books.splice(existingBookIndex, 1)
     callback(null, {})
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: "Book not found"
        })
    }
}

function allBooks(call, callback) {
    callback(null, { books })
}

server.bindAsync("127.0.0.1:50000", grpc.ServerCredentials.createInsecure(), (error, port) => {
  server;
  console.log(`listening on port ${port}`);
  });