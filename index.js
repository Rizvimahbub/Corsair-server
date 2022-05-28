const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require("stripe")(process.env.SECRET_KEY)
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@computer-parts.as9aiil.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const displayCollection = client.db('Compuiter-parts').collection('display');
        const orderCollection = client.db('Compuiter-parts').collection('order');
        const reviewCollection = client.db('Compuiter-parts').collection('reviews');
        const profileCollection = client.db('Compuiter-parts').collection('profileInfo');
        const userCollection = client.db('Compuiter-parts').collection('users');
        const paymentCollection = client.db('Compuiter-parts').collection('payments');


        app.get('/tool', async (req, res) => {
            const result = await displayCollection.find().toArray();
            res.send(result);
        })

        app.get('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await displayCollection.findOne(query);
            res.send(tool);
        });


        app.put('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const quantity = req.body.newQuantity;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: quantity
                }
            }
            const tool = await displayCollection.updateOne(query, updateDoc, options);
            res.send(tool);
        })


        app.post('/order', async (req, res) => {
            const tool = req.body;
            const result = await orderCollection.insertOne(tool);
            res.send(result)
        })


        app.get('/order', async (req, res) => {
            const query = {};
            const result = await orderCollection.find(query).toArray();
            res.send(result)
        })


        app.get('/order/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await orderCollection.find(filter).toArray();
            res.send(result)
        })


        app.patch('/order/:id', async(req, res) => {
            const id = req.params.id;
            const payment = req.body;
            console.log(payment)
            const filter = {_id:ObjectId(id)};
            const newDoc = {
                $set : {
                    paid:true,
                    transactionId : payment.transactionId
                }
            };
            const updatedOrder = await orderCollection.updateOne(filter, newDoc);
            const updatedPayment = await paymentCollection.insertOne(payment);
            res.send(newDoc)
        })


        app.get('/orders/order/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await orderCollection.findOne(filter);
            res.send(result)
        })


        app.delete('/order/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await orderCollection.deleteOne(filter);
            res.send(result)
        })


        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().toArray();
            res.send(result);
        })

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result)
        });


        app.post('/profile/', async (req, res) => {
            const info = req.body;
            const result = await profileCollection.insertOne(info);
            res.send(result);
        });

        app.put('/profile/:email', async (req, res) => {
            const email = req.params.email;
            const profile = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const newDoc = {
                $set: {
                    address: profile.address,
                    city: profile.city,
                    phone: profile.phone
                }
            }
            const result = await profileCollection.updateOne(filter, newDoc, options);
            res.send(result);
        })


        app.get('/profile/:email', async (req, res) => {
            const email = req.params.email; 
            const filter = { email: email };
            const result = await profileCollection.findOne(filter);   
            console.log(result)
            res.send(result);
        })


        app.post('/users', async (req, res) => {
            const query = req.body;
            const result = await userCollection.insertOne(query);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const users = {};
            const result = await userCollection.find(users).toArray();
            res.send(result)
        })

        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const options = { upsert: true };
            const newDoc = {
                $set: { role: 'admin' }
            }
            const result = await userCollection.updateOne(filter, newDoc, options);
            res.send(result)
        })


        app.put('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const newDoc = {
                $set: { role: 'user' }
            }
            const result = await userCollection.updateOne(filter, newDoc);
            res.send(result)
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await userCollection.findOne(filter);
            res.send(result)
        });


        app.post('/create-payment-intent', async (req, res) => {
            try {
                const service = req.body;
                const price = service.totalPrice;
                console.log(price)
                if (price) {
                    const totalAmount = price * 100;
                    const paymentIntent = await stripe.paymentIntents.create({
                        amount: totalAmount,
                        currency: "usd",
                        payment_method_types: [
                            "card"
                        ],
                    });
                    res.send({
                        clientSecret: paymentIntent.client_secret,
                    })
                }
            }
            catch (error) {
                console.log(error)
            }
        })
    }
    finally {

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Connected')
})


app.listen(port, () => {
    console.log('Connected')
})