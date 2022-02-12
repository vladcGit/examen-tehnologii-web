const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize');
const app = express();

let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  sequelize = new Sequelize({
    storage: 'database.db',
    dialect: 'sqlite',
    define: {
      timestamps: false,
    },
    logging: false,
  });
}

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  titlu: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [5, 255],
    },
  },
  gen: {
    type: DataTypes.ENUM('COMEDY', 'TRAGEDY', 'SF', 'Horror'),
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
});

const VirtualShelf = sequelize.define(
  'VirtualShelf',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    descriere: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 255],
      },
    },
    data: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { tableName: 'VirtualShelves' }
);

VirtualShelf.hasMany(Book, { onDelete: 'CASCADE' });

const resursa = VirtualShelf;
const subresursa = Book;

app.get('/sync', async (req, res) => {
  try {
    await sequelize.sync({ force: true });

    const sampleData = [
      {
        descriere: 'Favorite books',
        data: new Date(),
      },
      {
        descriere: "Kid's books",
        data: new Date(),
      },
      {
        descriere: 'Highschool books',
        data: new Date(),
      },
    ];

    const promisiuni = sampleData.map((shelf) => resursa.create(shelf));
    await Promise.all(promisiuni);
    res.status(200).send('Database synchronized');
  } catch (e) {
    res.status(500).json(e.message);
    console.error(e);
  }
});

app.get('/shelves/all', async (req, res) => {
  try {
    const shelves = await resursa.findAll({ include: [subresursa] });
    res.status(200).json(shelves);
  } catch (e) {
    res.status(500).json(e.message);
    console.error(e);
  }
});

app.get('/shelves', async (req, res) => {
  try {
    let { page, perPagina, description, sorted, id } = req.query;
    if (!page || page < 1) page = 1;
    if (!perPagina || perPagina < 2) perPagina = 2;
    //in bd e indexat de la 0
    page--;

    const queryParams = {
      limit: perPagina,
      offset: perPagina * page,
      where: {
        descriere: {
          [Op.like]: '%' + description + '%',
        },
      },
    };
    if (sorted === 'true') queryParams.order = [['data', 'ASC']];
    if (id !== '' && id && id > 0) queryParams.where.id = id;

    const shelves = await resursa.findAndCountAll(queryParams);
    res.status(200).json(shelves.rows);
  } catch (e) {
    res.status(500).json(e.message);
    console.error(e);
  }
});

app.get('/shelves/number', async (req, res) => {
  try {
    const numar = await resursa.count();
    res.status(200).json({ numar });
  } catch (e) {
    res.status(500).json(e.message);
    console.error(e);
  }
});

app.get('/shelves/:id', async (req, res) => {
  try {
    const shelf = await resursa.findByPk(req.params.id, {
      include: [subresursa],
    });
    if (!shelf)
      return res.status(400).json({ error: 'The resource does not exist' });
    res.status(200).json(shelf);
  } catch (e) {
    res.status(500).json(e.message);
    console.error(e);
  }
});

app.post('/shelves', async (req, res) => {
  try {
    const shelf = await resursa.create(req.body);
    res.status(201).json(shelf);
  } catch (e) {
    res.status(500).json(e.message);
    console.error(e);
  }
});

app.put('/shelves/:id', async (req, res) => {
  try {
    const shelf = await resursa.findByPk(req.params.id);
    if (shelf) {
      await shelf.update(req.body);
      res.status(200).json(shelf);
    } else res.status(400).json({ error: 'The resource does not exist' });
  } catch (e) {
    res.status(500).json(e.message);
    console.error(e);
  }
});

app.delete('/shelves/:id', async (req, res) => {
  try {
    const shelf = await resursa.findByPk(req.params.id);
    if (shelf) {
      await shelf.destroy();
      res.status(200).json({ message: 'Success' });
    } else res.status(400).json({ error: 'The resource does not exist' });
  } catch (e) {
    res.status(500).json(e.message);
    console.error(e);
  }
});

app.get('/shelves/:id/books/:idSubresursa', async (req, res) => {
  try {
    const shelf = await resursa.findByPk(req.params.id, {
      include: [
        {
          model: subresursa,
          where: {
            id: req.params.idSubresursa,
          },
        },
      ],
    });
    if (shelf && shelf.Books.length > 0) {
      const book = shelf.Books[0];
      res.status(202).json(book);
    } else {
      res.status(400).json({
        error: 'Either the resource or the subresource does not exist',
      });
    }
  } catch (e) {
    res.status(500).json(e.message);
    console.error(e);
  }
});

app.get('/shelves/:id/books', async (req, res) => {
  try {
    const shelf = await resursa.findByPk(req.params.id, {
      include: [subresursa],
    });
    if (!shelf)
      return res.status(400).json({ error: 'The resource does not exist' });
    const books = shelf.Books;
    res.status(200).json(books);
  } catch (e) {
    res.status(500).json(e.message);
    console.error(e);
  }
});

app.post('/shelves/:id/books', async (req, res) => {
  try {
    const shelf = await resursa.findByPk(req.params.id);
    if (!shelf)
      return res.status(400).json({ error: 'The resource does not exist' });
    const book = new subresursa(req.body);
    book.VirtualShelfId = shelf.id;
    await book.save();
    res.status(201).json(book);
  } catch (e) {
    res.status(500).json(e.message);
    console.error(e);
  }
});

app.put('/shelves/:id/books/:idSubresursa', async (req, res) => {
  try {
    const shelf = await resursa.findByPk(req.params.id, {
      include: [
        {
          model: subresursa,
          where: {
            id: req.params.idSubresursa,
          },
        },
      ],
    });
    if (shelf) {
      const book = shelf.Books[0];
      await book.update(req.body);
      res.status(202).json(book);
    } else {
      res.status(400).json({
        error: 'Either the resource or the subresource does not exist',
      });
    }
  } catch (e) {
    res.status(500).json(e.message);
    console.error(e);
  }
});

app.delete('/shelves/:id/books/:idSubresursa', async (req, res) => {
  try {
    const shelf = await resursa.findByPk(req.params.id, {
      include: [
        {
          model: subresursa,
          where: {
            id: req.params.idSubresursa,
          },
        },
      ],
    });
    if (shelf) {
      const book = shelf.Books[0];
      await book.destroy();
      res.status(200).json({ message: 'Success' });
    } else {
      res.status(400).json({
        error: 'Either the resource or the subresource does not exist',
      });
    }
  } catch (e) {
    res.status(500).json(e.message);
    console.error(e);
  }
});

app.get('/export', async (req, res) => {
  try {
    const data = await resursa.findAll({
      include: {
        model: subresursa,
        attributes: {
          exclude: ['id', 'VirtualShelfId'],
        },
      },
      attributes: { exclude: ['id'] },
    });
    const text = JSON.stringify(data);
    res.status(200).send(text);
  } catch (e) {
    res.status(500).json(e.message);
    console.error(e);
  }
});

app.post('/import', async (req, res) => {
  try {
    for (obj of req.body.jsonData) {
      const shelf = await resursa.create(obj);
      for (child of obj.Books) {
        const book = new subresursa(child);
        book.VirtualShelfId = shelf.id;
        await book.save();
      }
    }
    res.status(200).json({ message: 'Succesfully imported' });
  } catch (e) {
    res.status(500).json(e.message);
    console.error(e);
  }
});

module.exports = app;
