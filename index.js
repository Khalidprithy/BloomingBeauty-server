const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const res = require('express/lib/response');
const { decode } = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();

require('dotenv').config();

// Middleware

app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hpuq8ry.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('beautyApp').collection('product');

        // Login Auth

        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })


        // Find All
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        // Find One
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        })


        // Delete Product
        app.delete('/products/:id', async (req, res) => {
            const id = req.params;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result)
        });
        // Delete Product
        app.delete('/products/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = purchaseCollection.deleteOne(query);
            res.send(result);
        })

        // Add Product
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result)
        })
        // Find added Product
        app.get('/product', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await productCollection.find(query).toArray();
            res.send(result)
        })

        // Update product
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedProduct.quantity,
                }
            };
            const result = await productCollection.updateOne(filter, updatedDoc, options);
            res.send(result)

        })

    } finally {
        // await client.close();
    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Blooming Beauty app server running')
});

app.listen(port, () => {
    console.log('Listening to BloomingBeauty server', port)
})


// https://mighty-brushlands-85501.herokuapp.com/
// To update - git add commit push + git push heroku main
