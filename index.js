const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hgznyse.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const serviceCollection = client.db('carDoctor').collection('services');
        // const bookingCollection = client.db('carDoctor').collection('booking');
        const usersCollection = client.db('carDoctor').collection('users');

        // get method for services
        app.get('/services', async (req, res) => {
            const service = serviceCollection.find();
            const result = await service.toArray();
            res.send(result);
        })

        // to get specific data from database
        // app.get('/services/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const options = {
        //         projection: { img: 1, title: 1, price: 1, service_id: 1 },
        //     };
        //     const result = await serviceCollection.findOne(query, options);
        //     res.send(result);
        // })

        // post method for booking
        // app.post('/booking', async (req, res) => {
        //     const booking = req.body;
        //     const result = await bookingCollection.insertOne(booking);
        //     res.send(result);
        // })

        // post method for user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exist', insertedId: null })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })

        // get method for users
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result)
        })

        // get method for Admin
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === 'admin';
            }
            res.send({ admin });
        })

        // patch method for user to make admin
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })

        // get data from database
        // app.get('/booking', async (req, res) => {
        //     let query = {};
        //     if (req.query?.email) {
        //         query = { email: req.query.email }
        //     }
        //     const result = await bookingCollection.find(query).toArray();
        //     res.send(result);
        // })

        // delete operation
        // app.delete('/booking/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) };
        //     const result = await bookingCollection.deleteOne(query);
        //     res.send(result);
        // })

        // update operation
        // app.patch('/booking/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: new ObjectId(id) };
        //     const updateBooking = req.body;
        //     const update = {
        //         $set: {
        //             status: updateBooking.status
        //         }
        //     }
        //     const result = await bookingCollection.updateOne(filter, update);
        //     res.send(result)
        // })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Car server is running !')
})

app.listen(port, () => {
    console.log(`Car server is running on port ${port}`)
})