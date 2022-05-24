const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
// const mg = require('nodemailer-mailgun-transport');
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@computer-parts.as9aiil.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const displayCollection = client.db('Compuiter-parts').collection('display');


        app.get('/tool', async (req, res) => {
            const result = await displayCollection.find().toArray();
            res.send(result);
        })

        app.get('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await displayCollection.findOne(query);
            res.send(tool);
        })
    }
    finally{

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Paisi tore khara')
})


app.listen(port, () => {
    console.log('Khara aitesi')
})