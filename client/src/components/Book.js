import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Typography, Link as LinkComp } from '@mui/material';

const SERVER = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api`;
// const SERVER = 'http://localhost:3001/api';

export default function Book() {
  const [book, setBook] = useState({});
  const { id, bookId } = useParams();
  const fetchBook = async (id, bookId) => {
    const res = await fetch(`${SERVER}/shelves/${id}/books/${bookId}`);
    const data = await res.json();
    setBook(data);
  };
  useEffect(() => {
    fetchBook(id, bookId);
  }, [id, bookId]);
  return (
    <div className="container">
      <Typography
        component="h1"
        variant="h2"
        align="center"
        color="text.primary"
        gutterBottom
      >
        {book.titlu}
      </Typography>
      <Typography variant="h5" align="center" color="text.secondary" paragraph>
        Genre: {book.gen}
      </Typography>
      <Typography variant="h5" align="center" color="text.secondary" paragraph>
        <LinkComp href={book.url}>Link</LinkComp>
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        size="large"
        sx={{ marginTop: '40px' }}
        component={Link}
        to={`/shelf/${id}`}
      >
        Go back
      </Button>
    </div>
  );
}
