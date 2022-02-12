import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  TextField,
  PaginationItem,
  Pagination,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  ListItem,
  ListItemAvatar,
  Avatar,
  Button,
  Switch,
  FormControlLabel,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { Link, useLocation } from 'react-router-dom';

const SERVER = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api`;
// const SERVER = 'http://localhost:3001/api';

function App() {
  const [shelves, setShelves] = useState([]);
  const [number, setNumber] = useState(0);
  const [numberPerPage, setNumberPerPage] = useState(2);
  const [description, setDescription] = useState('');
  const [checked, setChecked] = useState(false);
  const [id, setId] = useState('');

  const location = useLocation();
  const hiddenFileInput = useRef(null);

  const fetchCount = async () => {
    const res = await fetch(`${SERVER}/shelves/number`);
    const data = await res.json();
    setNumber(data.numar);
  };

  useEffect(() => {
    fetchCount();
  }, []);

  useEffect(() => {
    const f = async () => {
      const pagina = new URLSearchParams(location.search).get('page') || 1;
      if (parseInt(numberPerPage) < 2) setNumberPerPage(2);
      const res = await fetch(
        `${SERVER}/shelves?page=${pagina}&perPagina=${numberPerPage}&description=${description}&sorted=${checked}&id=${id}`
      );
      const resData = await res.json();
      setShelves(resData);
    };
    f();
  }, [location.search, numberPerPage, number, description, checked, id]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure that you want to delete this shelf?'))
      return;
    const res = await fetch(`${SERVER}/shelves/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      await fetchCount();
    } else alert('Error');
  };

  const downloadJson = async () => {
    const res = await fetch(`${SERVER}/export`);
    if (!res.ok) return alert('Error when fetching from server');
    const data = await res.text();
    const blob = new Blob([data], { type: 'text/json' });
    const a = document.createElement('a');
    a.download = 'shelves.json';
    a.href = window.URL.createObjectURL(blob);
    a.click();
    a.remove();
  };

  const importJson = async (e) => {
    if (e.target.files[0].size / 1024 / 1024 > 15) {
      return alert('The file is too big');
    }
    const fisier = e.target.files[0];
    const fileReader = new FileReader();

    fileReader.onload = async (e) => {
      e.preventDefault();
      const content = e.target.result;
      const jsonData = JSON.parse(content);

      const res = await fetch(`${SERVER}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jsonData }),
      });
      if (res.ok) {
        fetchCount();
      } else {
        alert('Error when sending data to server');
      }
    };
    await fileReader.readAsText(fisier);
  };

  function ComponentPagini() {
    const query = new URLSearchParams(location.search);
    const page = parseInt(query.get('page') || '1', 10);
    return (
      <Pagination
        size="large"
        color="primary"
        style={{ position: 'absolute', bottom: 0 }}
        page={page}
        count={Math.ceil(number / numberPerPage)}
        renderItem={(item) => (
          <PaginationItem
            component={Link}
            to={`/${item.page === 1 ? '' : `?page=${item.page}`}`}
            {...item}
          />
        )}
      />
    );
  }
  return (
    <div className="container">
      <Button
        variant="contained"
        size="large"
        color="primary"
        sx={{ marginBottom: '30px' }}
        component={Link}
        to="/shelf/new"
      >
        Add virtual shelf
      </Button>
      <div>
        <Button
          variant="contained"
          size="small"
          color="secondary"
          sx={{ marginBottom: '30px', marginRight: '10px' }}
          onClick={downloadJson}
        >
          Export to JSON
        </Button>
        <Button
          variant="contained"
          size="small"
          color="secondary"
          sx={{ marginBottom: '30px', marginLeft: '10px' }}
          onClick={() => hiddenFileInput.current.click()}
        >
          Import from JSON
        </Button>
        <input
          type="file"
          ref={hiddenFileInput}
          onChange={importJson}
          style={{ display: 'none' }}
          accept="application/JSON"
        />
      </div>
      <TextField
        label="Shelves per page"
        type="number"
        sx={{ width: 150 }}
        InputLabelProps={{
          shrink: true,
        }}
        inputProps={{
          min: 2,
          max: 10,
        }}
        value={numberPerPage}
        onChange={(e) => setNumberPerPage(e.target.value)}
      />

      <Typography variant="h5" sx={{ marginTop: '20px' }}>
        Filter by:
      </Typography>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '20px',
          width: 400,
        }}
      >
        <TextField
          label="Description"
          sx={{ width: 150 }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          label="Id"
          type="number"
          sx={{ width: 150 }}
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            min: 1,
          }}
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
      </div>
      <FormControlLabel
        sx={{ marginTop: '20px' }}
        control={
          <Switch
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
        }
        label="Sorted by date"
      />
      <Box
        sx={{
          width: '100%',
          maxWidth: 360,
          marginTop: '50px',
          // bgcolor: 'success.main',
          // color: 'white',
        }}
      >
        <List component="nav" sx={{ overflowY: 'auto', marginBottom: '50px' }}>
          {Array.isArray(shelves) &&
            shelves.length > 0 &&
            shelves.map((shelf) => {
              return (
                <ListItem key={shelf.id}>
                  <ListItemButton component={Link} to={`/shelf/${shelf.id}`}>
                    <ListItemAvatar>
                      <Avatar>
                        <LibraryBooksIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${shelf.descriere} (${shelf.id})`}
                      secondary={`${new Date(shelf.data).toLocaleDateString()}`}
                    />
                  </ListItemButton>
                  <IconButton component={Link} to={`/shelf/edit/${shelf.id}`}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(shelf.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              );
            })}
        </List>
      </Box>
      <ComponentPagini />
    </div>
  );
}

export default App;
