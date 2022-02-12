import {
  Button,
  Typography,
  List,
  Avatar,
  IconButton,
  ListItemText,
  Box,
  ListItem,
  ListItemButton,
  ListItemAvatar,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BookIcon from '@mui/icons-material/Book';

const SERVER = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api`;
// const SERVER = 'http://localhost:3001/api';

export default function VirtualShelf() {
  const [shelf, setShelf] = useState({});
  const { id } = useParams();
  const fetchShelf = async (id) => {
    const res = await fetch(SERVER + '/shelves/' + id);
    const data = await res.json();
    setShelf(data);
  };
  useEffect(() => {
    fetchShelf(id);
  }, [id]);

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure that you want to delete this book?'))
      return;
    const res = await fetch(`${SERVER}/shelves/${id}/books/${bookId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      await fetchShelf(id);
    } else alert('Error');
  };

  return (
    <div className="container">
      <Typography
        component="h1"
        variant="h2"
        align="center"
        color="text.primary"
        gutterBottom
      >
        {shelf.descriere}
      </Typography>
      <Typography variant="h5" align="center" color="text.secondary" paragraph>
        Creation date: {shelf.data && new Date(shelf.data).toLocaleDateString()}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        sx={{ marginTop: '40px' }}
        component={Link}
        to={`/shelf/${id}/books/new`}
      >
        Add book
      </Button>
      <Box
        sx={{
          width: '100%',
          maxWidth: 360,
          // bgcolor: 'success.main',
          // color: 'white',
          marginTop: '50px',
        }}
      >
        <List component="nav" sx={{ overflowY: 'auto', marginBottom: '50px' }}>
          {shelf.Books?.map((book, index) => {
            return (
              <ListItem key={book.id}>
                <ListItemButton
                  onClick={() => {
                    window.location.href = `/shelf/${id}/books/${book.id}`;
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <BookIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${book.titlu} (${book.gen})`}
                    secondary={`Url:${book.url}`}
                  />
                </ListItemButton>
                <IconButton
                  component={Link}
                  to={`/shelf/${id}/books/edit/${book.id}`}
                >
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(book.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      <Button
        variant="contained"
        color="secondary"
        size="large"
        component={Link}
        to="/"
      >
        Go back
      </Button>
    </div>
  );
}
