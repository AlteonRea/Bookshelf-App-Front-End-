const books = [];
const scoreOptions = [
  "1 Horrible",
  "2 Bad",
  "3 Average",
  "4 Great",
  "5 Masterpiece",
];
const RENDER_EVENT = "render-books";
const SAVE_EVENT = "save_book";
const STORAGE_KEY = "SHELFBOOK_APPS";

document.addEventListener(RENDER_EVENT, (event) => {
  const bookshelf = document.getElementById("bookshelf");
  const bookShelfHeader = document.getElementById("bookshelf-header");
  bookshelf.innerHTML = "";
  bookshelf.append(bookShelfHeader);

  const booksList = event.detail.booksList;
  console.log(booksList);
  const bookCount = document.getElementById("book-count");
  bookCount.textContent = booksList.length;
  for (const book of booksList) {
    const bookElement = createBookElement(book);
    bookshelf.append(bookElement);
  }
});

const dispatchRenderEvent = (booksList) => {
  const event = new CustomEvent(RENDER_EVENT, {
    detail: { booksList },
  });
  document.dispatchEvent(event);
};

const filterBooks = (query) => {
  return books.filter(
    (book) =>
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase())
  );
};

document.addEventListener("DOMContentLoaded", () => {
  const submitForm = document.getElementById("input-book");
  submitForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addBook();
  });
  const deleteAllButton = document.getElementById("delete-books");
  deleteAllButton.addEventListener("click", () => {
    showConfirmationDialog(-1);
  });
  const searchForm = document.getElementById("search-book");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = document.getElementById("searchInput").value;
    console.log(query);
    dispatchRenderEvent(filterBooks(query));
  });
  const allButton = document.getElementById("all-button");
  allButton.addEventListener("click", () => {
    dispatchRenderEvent(books);
  });

  const completedButton = document.getElementById("completed-button");
  completedButton.addEventListener("click", () => {
    dispatchRenderEvent(books.filter((book) => book.isComplete == true));
  });

  const uncompletedButton = document.getElementById("uncompleted-button");
  uncompletedButton.addEventListener("click", () => {
    dispatchRenderEvent(books.filter((book) => book.isComplete == false));
  });
});

document.addEventListener(SAVE_EVENT, () => {
  console.log(localStorage.getItem(STORAGE_KEY));
});

const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert("Your browser does not support storage");
    return false;
  }
  return true;
};

const saveData = () => {
  if (isStorageExist) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    dispatchRenderEvent(books);
  }
};

const loadDataFromStorage = () => {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  dispatchRenderEvent(books);
};

document.addEventListener("DOMContentLoaded", () => {
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

class Book {
  constructor(id, title, author, year, isComplete) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.year = parseInt(year);
    this.image = getRandomInt(1, 5);
    this.isComplete = isComplete;
  }
}

const generateId = () => {
  return +new Date();
};

const addBook = () => {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const isComplete = document.getElementById("inputBookIsComplete").checked;

  const id = generateId();

  const book = new Book(id, title, author, year, isComplete);
  books.push(book);
  dispatchRenderEvent(books);
  saveData();
};

const findBook = (bookId) => {
  return books.find((book) => book.id === bookId);
};

const deleteBook = (bookId) => {
  const bookIndex = books.findIndex((book) => book.id === bookId);
  if (bookIndex !== -1) {
    books.splice(bookIndex, 1);
    dispatchRenderEvent(books);
    saveData();
  }
};

const showConfirmationDialog = (bookId) => {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  let dialogText = "are you sure you want to delete this book?";
  console.log(bookId);
  console.log(typeof bookId);
  if (bookId === -1) {
    dialogText = "Are you sure you want to delete all books?";
  }
  modal.innerHTML = `
    <div class="modal-content">
      ${dialogText}
      <div class="modal-button-container">
        <button class="confirm">Yes</button>
        <button class="cancel">No</button>
      </div>
    </div>
  `;

  modal.querySelector(".confirm").addEventListener("click", () => {
    if (bookId === -1) {
      deleteAllBook();
    } else {
      deleteBook(bookId);
    }
    modal.remove();
  });

  modal.querySelector(".cancel").addEventListener("click", () => {
    modal.remove();
  });

  document.body.appendChild(modal);
};

const deleteAllBook = () => {
  books.splice(0, books.length);
  dispatchRenderEvent(books);
  saveData();
};

const changeBookShelf = (bookId, isComplete) => {
  const book = findBook(bookId);
  if (book == null) return;
  const isTrue = isComplete === "true";
  book.isComplete = isTrue;
  dispatchRenderEvent(books);
  saveData();
};

const createBookElement = (book) => {
  const { id, title, author, year, image, isComplete } = book;

  const bookElement = document.createElement("tr");

  const td1 = document.createElement("td");
  td1.classList.add("book-detail");

  const img = document.createElement("img");
  img.src = `assets/${image}.jpg`;

  const detailContainer = document.createElement("div");

  const bookTitle = document.createElement("h4");
  bookTitle.innerText = title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = author;
  bookAuthor.classList.add("detail-author");

  detailContainer.append(bookTitle, bookAuthor);
  td1.append(img, detailContainer);

  const td2 = document.createElement("td");
  const bookYear = document.createElement("h3");
  bookYear.textContent = year;
  td2.append(bookYear);

  const td3 = document.createElement("td");
  const shelfSelect = document.createElement("select");
  shelfSelect.classList.add("shelf-select");
  const shelfOption1 = document.createElement("option");
  shelfOption1.value = true;
  shelfOption1.textContent = "Completed";
  const shelfOption2 = document.createElement("option");
  shelfOption2.value = false;
  shelfOption2.textContent = "Uncompleted";

  shelfSelect.addEventListener("change", () => {
    changeBookShelf(id, shelfSelect.value);
  });

  if (isComplete) {
    shelfOption1.selected = true;
  } else {
    shelfOption2.selected = true;
  }

  shelfSelect.append(shelfOption1, shelfOption2);
  td3.append(shelfSelect);

  const td4 = document.createElement("td");
  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
  deleteButton.classList.add("delete-button");

  deleteButton.addEventListener("click", () => {
    showConfirmationDialog(id);
  });

  const deleteButtonContainer = document.createElement("div");
  deleteButtonContainer.classList.add("delete-button-container");
  deleteButtonContainer.append(deleteButton);
  td4.append(deleteButtonContainer);
  bookElement.append(td1, td2, td3, td4);
  return bookElement;
};
