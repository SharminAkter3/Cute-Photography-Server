const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


//middle wares
app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASSWORD);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5nmtx0a.mongodb.net/?retryWrites=true&w=majority`;

// console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('cutePhoto').collection('services');
        const reviewCollection = client.db('cutePhoto').collection('reviews')

        app.get('/services', async (req, res) => {
            const limitQuery = parseInt(req.query.limit);
            const sort = { date: -1 }

            if (limitQuery) {
                const cursor = serviceCollection.find({}).sort(sort).limit(limitQuery);
                const result = await cursor.toArray();
                res.send(result);
            }
            else {
                const cursor = serviceCollection.find({}).sort(sort);
                const result = await cursor.toArray();
                res.send(result);
            }

        });

        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });


        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service)
        });

        //review api 
        app.get('/reviews', async (req, res) => {
            // console.log(req.query.email)
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });


        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const query = { _id: ObjectId(id) };
            const updated = {
                $set: {
                    status: status
                }
            }
            const result = await reviewCollection.updateOne(query, updated);
            res.send(result);
        })


        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(error => console.error(error));


app.get('/', (req, res) => {
    res.send('Cute Photography API running');
});

app.listen(port, () => {
    console.log('Cute Photography server is running on port', port);
})