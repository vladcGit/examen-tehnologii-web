import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './components/App';
import AppBar from './components/AppBar';
import Book from './components/Book';
import BookForm from './components/BookForm';
import NotFound from './components/NotFound';
import VirtualShelf from './components/VirtualShelf';
import VirtualShelfForm from './components/VirtualShelfForm';
import './index.css';

ReactDOM.render(
  <>
    <AppBar />
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<App />} />
        <Route exact path="/shelf/new" element={<VirtualShelfForm />} />
        <Route exact path="/shelf/edit/:id" element={<VirtualShelfForm />} />
        <Route exact path="/shelf/:id" element={<VirtualShelf />} />
        <Route exact path="/shelf/:id/books/new" element={<BookForm />} />
        <Route
          exact
          path="/shelf/:id/books/edit/:bookId"
          element={<BookForm />}
        />
        <Route exact path="/shelf/:id/books/:bookId" element={<Book />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </>,
  document.getElementById('root')
);
