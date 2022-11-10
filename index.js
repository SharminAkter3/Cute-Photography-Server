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

// function verifyJWT(req, res, next) {
//     console.log(req.headers.authorizaton)
//     const authHeader = req.headers.authorizaton;
//     if (!authHeader) {
//         return res.status(401).send({ message: 'unauthorized access' })
//     }
//     const token = authHeader.split(' ')[1];
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
//         if (error) {
//             return res.status(401).send({ message: 'unauthorized access' })
//         }
//         req.decoded = decoded;
//         next();
//     })
// }


async function run() {
    try {
        const serviceCollection = client.db('cutePhoto').collection('services');
        const reviewCollection = client.db('cutePhoto').collection('reviews');

        //load user information
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ token });
            // console.log(user);
        })

        //Get limited service from database and send to client site
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

        //Get all service from database and send to client site
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

        //post service from database 
        app.post('/service', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        });

        //review api 

        app.get('/reviews', async (req, res) => {
            console.log(req.headers.authorization)
            // const decoded = req.decoded;
            // console.log(decoded);

            // if (decoded?.email !== req.query?.email) {
            //     res.status(403).send({ message: 'unauthorized access' })
            // }

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query?.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });


        //Get review data from database and send to client site
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


        //Update review from database 
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        // update review to database 
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.findOne(query);
            res.send(result);
        })

        //update review to database

        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const user = req.body;
            const option = { upsert: true };
            const updatedUser = {
                $set: {
                    name: user.name,
                    email: user.email
                }
            }
            const result = await reviewCollection.updateOne(filter, updatedUser, option);
            res.send(result);
        })


        //Delete review service from database
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
    res.send('Cute Photography API is running');
});

//server running this port
app.listen(port, () => {
    console.log('Cute Photography server is running on port', port);
})