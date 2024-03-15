const pg = require('pg');
const express = require('express');

const client = new pg.Client(
	process.env.DATABASE_URL || 'postgres://localhost/acme_iceCream_db'
);
const app = express();

app.use(require('morgan')('dev'));
app.use(express.json());

app.post('/api/flavors', async (req, res, next) => {
	try {
		const SQL = `
        INSERT INTO flavors(txt)
        VALUES ($1)
        RETURNING *
        `;
		const response = await client.query(SQL, [req.body.txt]);
		res.send(response.rows[0]);
	} catch (error) {
		next(error);
	}
});

app.get('/api/flavors', async (req, res, next) => {
	try {
		const SQL = `SELECT * from flavors;
        `;
		const response = await client.query(SQL);
		res.send(response.rows);
	} catch (error) {
		next(error);
	}
});

app.get('/api/flavors/:id', async (req, res, next) => {
	try {
		const SQL = `SELECT * FROM flavors
        WHERE id = $1
        `;
		const response = await client.query(SQL, [req.params.id]);
		res.send(response.rows[0]);
	} catch (error) {
		next(error);
	}
});

app.put('/api/flavors/:id', async (req, res, next) => {
	try {
		const SQL = `UPDATE flavors
        SET txt=$1, is_favorite=$2, updated_at= now()
        WHERE id=$3 RETURNING *`;

		const response = await client.query(SQL, [
			req.body.txt,
			req.body.is_favorite,
			req.params.id,
		]);
		res.send(response.rows[0]);
	} catch (error) {
		next(error);
	}
});

app.delete('/api/flavors/:id', async (req, res, next) => {
	try {
		const SQL = `
        DELETE from flavors
        WHERE id = $1
      `;
		const response = await client.query(SQL, [req.params.id]);
		res.sendStatus(204);
	} catch (ex) {
		next(ex);
	}
});

const init = async () => {
	await client.connect();
	console.log('Connected to database');
	let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        is_favorite BOOLEAN DEFAULT false,
        txt VARCHAR(50) NOT NULL
    )
    `;

	await client.query(SQL);
	console.log('Tables created');

	SQL = `
    
    INSERT INTO flavors(txt) VALUES('chocolate');
    INSERT INTO flavors(txt) VALUES('vanilla');
    INSERT INTO flavors(txt, is_favorite) VALUES('dreamsicle', true);
    INSERT INTO flavors(txt) VALUES('neopolitan');
    `;

	await client.query(SQL);
	console.log('Data seeded');

	const port = process.env.PORT || 3000;
	app.listen(port, () => console.log(`Listening to port ${port}`));
};

init();
