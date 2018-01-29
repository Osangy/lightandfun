require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('Hello World!'));

app.post('/', (req, res) => {
	console.log(req.body);
	res.json({});
});

app.post('/intro', (req, res) => {
	console.log(req.body);
	res.json({});
});

app.post('/lastweight', (req, res) => {
	console.log(req.body);

	const weight = parseInt(req.body.last_weight);
	console.log(weight);
	console.log(req.body['messenger user id']);
	if (weight > 62) {
		res.json({
			redirect_to_blocks: ['encouragement_weekly']
		});
	} else
		res.json({
			redirect_to_blocks: ['happy_weekly']
		});
});

app.post('/lastphoto', (req, res) => {
	console.log(req.body);
	res.json({});
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
