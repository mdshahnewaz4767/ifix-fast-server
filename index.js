const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

const port = 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mkcgo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const servicesCollection = client.db("iFixFastStore").collection("services");
    const bookingsCollection = client.db("iFixFastStore").collection("bookings");
    const reviewsCollection = client.db("iFixFastStore").collection("reviews");
    const adminsCollection = client.db("iFixFastStore").collection("admins");
  
    //read service data
    app.get('/services', (req, res) => {
        servicesCollection.find({})
        .toArray( (err, documents) => {
        res.send(documents);
        })
    })

    //read single service data
    app.get('/service/:id', (req, res) => {
        servicesCollection.find({_id: ObjectId(req.params.id)})
        .toArray( (err, documents) => {
        res.send(documents[0]);
        })
    })

    //insert booking data
    app.post('/addBooking', (req, res) => {
        const booking = req.body;
        bookingsCollection.insertOne(booking)
        .then(result => {
        console.log(result.insertedCount);
        res.send(result.insertedCount > 0);
        })
    })

    //read specific user booking data
    app.get('/bookings', (req, res) => {
        bookingsCollection.find({email: req.query.email})
        .toArray( (err, documents) => {
        res.send(documents);
        })
    })

    //read review data
    app.get('/reviews', (req, res) => {
        reviewsCollection.find({})
        .toArray( (err, documents) => {
        res.send(documents);
        })
    })

    //insert single review data
    app.post('/addReview', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const designation = req.body.designation;
        const quote = req.body.quote;
        const newImg = file.data;
        const encImg = newImg.toString('base64');
    

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        reviewsCollection.insertOne({ name, designation, quote, image})
        .then(result => {
            console.log(result);
            res.send(result.insertedCount > 0);
        })
        
    })

    //read all order data
    app.get('/orders', (req, res) => {
        bookingsCollection.find({})
        .toArray( (err, documents) => {
        res.send(documents);
        })
    })

    //insert single service data
    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const price = req.body.price;
        const description = req.body.description;

        const newImg = file.data;
        const encImg = newImg.toString('base64');
    

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        servicesCollection.insertOne({ title, price, description, image})
        .then(result => {
            console.log(result);
            res.send(result.insertedCount > 0);
        })
    })


    //insert admin
    app.post('/addAdmin', (req, res) => {
        const email = req.body.email;

        adminsCollection.insertOne({ email })
        .then(result => {
            console.log(result);
            res.send(result.insertedCount > 0);
        })
    })

    //limited access
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminsCollection.find({ email: email})
        .toArray((err, admins) => {
            res.send(admins.length > 0);
        })
    })

    //delete service data
    app.delete('/deleteService/:id', (req, res) => {
        const id = ObjectId(req.params.id);
        console.log('delete this', id);
        servicesCollection.findOneAndDelete({_id: id})
        .then(documents => res.send(!!documents.value))
    })

    //update  service data
    app.patch('/update/:id', (req, res) => {
        servicesCollection.updateOne({_id: ObjectId(req.params.id)}, 
            {
                $set: {title: req.body.title, price: req.body.price, description: req.body.description}
            }
        )
        .then(result => {
            res.send(result.modifiedCount > 0);
        })
    })

    //update  status
    app.patch('/updateStatus/:id', (req, res) => {
        bookingsCollection.updateOne({_id: ObjectId(req.params.id)}, 
            {
                $set: {status: req.body.status}
            }
        )
        .then(result => {
            res.send(result.modifiedCount > 0);
        })
    })



});



app.get('/', (req, res) => {
    res.send('Hi! I am Muhammad Shahnewaz')
  })
  
app.listen(process.env.PORT || port);