import { Autocomplete, Button, TextField, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const SERVER = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api`;
// const SERVER = 'http://localhost:3001/api';

export default function BookForm() {
  const { id, bookId } = useParams();
  const [titlu, setTitlu] = useState('');
  const [url, setUrl] = useState('');
  const [gen, setGen] = useState('COMEDY');
  const [genInput, setGenInput] = useState('');
  useEffect(() => {
    const fetchBook = async () => {
      if (bookId) {
        const res = await fetch(`${SERVER}/shelves/${id}/books/${bookId}`);
        const data = await res.json();
        setTitlu(data.titlu);
        setGen(data.gen);
        setUrl(data.url);
      }
    };
    fetchBook();
  }, [id, bookId]);
  const send = async () => {
    if (titlu && titlu.length > 4 && gen) {
      if (bookId) {
        const res = await fetch(`${SERVER}/shelves/${id}/books/${bookId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ titlu, gen, url }),
        });
        if (res.ok) window.location.href = `/shelf/${id}`;
        else alert('Error');
      } else {
        const res = await fetch(`${SERVER}/shelves/${id}/books`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ titlu, gen, url }),
        });
        if (res.ok) window.location.href = `/shelf/${id}`;
        else alert('Error');
      }
    } else
      alert(
        'The fields cannot be null and the title must have at least 5 letters'
      );
  };
  return (
    <div className="container">
      <Typography variant="h4">Enter the book's information:</Typography>
      <TextField
        label="Title"
        variant="outlined"
        sx={{ marginTop: '50px' }}
        value={titlu}
        onChange={(e) => setTitlu(e.target.value)}
      />
      <Autocomplete
        disablePortal
        disableClearable
        options={['COMEDY', 'TRAGEDY', 'SF', 'Horror']}
        renderInput={(params) => <TextField {...params} label="Genre" />}
        sx={{ marginTop: '50px', width: 200 }}
        value={gen}
        onChange={(event, newValue) => {
          setGen(newValue);
        }}
        inputValue={genInput}
        onInputChange={(event, newInputValue) => {
          setGenInput(newInputValue);
        }}
      />
      <TextField
        label="URL"
        variant="outlined"
        sx={{ marginTop: '50px' }}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        size="large"
        sx={{ marginTop: '50px' }}
        onClick={send}
      >
        Submit
      </Button>
      <Button
        variant="contained"
        color="secondary"
        size="large"
        sx={{ marginTop: '30px' }}
        component={Link}
        to={`/shelf/${id}`}
      >
        Close
      </Button>
    </div>
  );
}
