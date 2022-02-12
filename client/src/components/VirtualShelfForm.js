import { Button, TextField, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const SERVER = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api`;
// const SERVER = 'http://localhost:3001/api';

export default function VirtualShelfForm() {
  const { id } = useParams();
  const [descriere, setDescriere] = useState('');
  const [data, setData] = useState(new Date().toISOString().substring(0, 10));
  useEffect(() => {
    const fetchShelf = async () => {
      if (id) {
        const res = await fetch(SERVER + '/shelves/' + id);
        const data = await res.json();
        setDescriere(data.descriere);
        const dataConvertita = new Date(data.data);
        setData(dataConvertita.toISOString().substring(0, 10));
      }
    };
    fetchShelf();
  }, [id]);
  const send = async () => {
    if (descriere && descriere.length > 2 && data) {
      if (id) {
        const res = await fetch(SERVER + '/shelves/' + id, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            descriere,
            data: new Date(data),
          }),
        });
        if (res.ok) window.location.href = '/';
        else alert('Error');
      } else {
        const res = await fetch(SERVER + '/shelves/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            descriere,
            data: new Date(data),
          }),
        });
        if (res.ok) window.location.href = '/';
        else alert('Error');
      }
    } else
      alert(
        'The fields cannot be null and the description must have at least 3 letters'
      );
  };
  return (
    <div className="container">
      <Typography variant="h4">
        Enter the virtual shelf's information:
      </Typography>
      <TextField
        label="Description"
        variant="outlined"
        sx={{ marginTop: '50px' }}
        value={descriere}
        onChange={(e) => setDescriere(e.target.value)}
      />
      <TextField
        type={'date'}
        label="Release date"
        InputLabelProps={{
          shrink: true,
        }}
        sx={{ marginTop: '50px', width: 200 }}
        value={data}
        onChange={(e) => setData(e.target.value)}
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
        to="/"
      >
        Close
      </Button>
    </div>
  );
}
