require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const jwt = require('jsonwebtoken')

const { connectToDb, getDbConn } = require('./db.js');

const { ObjectId } = require('mongodb');



// jwt authentication 

const jwt_secret_key = process.env.SECRET_KEY;

function authenticateJWT(req, res, next) {
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
  if (!token) {
      return res.status(401).json({ error: 'Unauthorized access' });
  }
  try {
      const decodedToken = jwt.verify(token, jwt_secret_key);
      req.user = decodedToken;
      next();
  } catch (err) {
      return res.status(401).json({ error: 'Invalid Token' });
  }
}
// Database Connection
let db 
connectToDb((err) => {
    if (err) {
        console.error('Failed to connect to the database:');
        return;
    }
    console.log('Connected to the database successfully');

    app.listen(PORT, () => {
        console.log("Server is listening on port:", PORT);
    });
    db = getDbConn()
});

//////// Admins /////////
app.get('/v1/api/Admins',async (req, res) => {
  try {
    let arr = [] 
    const admins = await db.collection("Admins").find({}).sort({userName: 1}).toArray();
    arr = arr.concat(admins)
    res.json({"Admins": admins});
  } catch (err) {
    console.error('Failed to retrieve admins:', err);
    res.status(200).json({ error: 'Failed to retrieve admins' });
  }
});
// get one admin 
app.get('/v1/api/Admins/:id',authenticateJWT,async (req, res) => {
  try {
    let id = '6633a18bbec52a595b739221'
    if(!ObjectId.isValid(id)){
      res.status(200).json({ error: 'Failed to retrieve admins' });
    }
    let arr = [] 
    const admins = await db.collection("Admins").find({_id: new ObjectId(id)}).sort({}).toArray();
    arr = arr.concat(admins)
    res.json({"Admin: ": admins});
  } catch (err) {
    console.error('Failed to retrieve admins:', err);
    res.status(200).json({ error: 'Failed to retrieve admins' });
  }
});

app.post('/v1/api/Admins', async (req , res) => {
 try{
  const admin = req.body;
  await db.collection("Admins").insertOne(
    admin
  ).then(result => {
    res.status(201).json(result)
  })
 }catch (err) {
  console.error('Failed to insert admins:', err);
  res.status(500).json({ error: 'Failed to retrieve admins' });
}

});
app.patch('/v1/api/Admins/:id' ,authenticateJWT,  async (req , res) => {
  const update = req.body
   const id = req.params.id;
  if(ObjectId.isValid(id)){
    let collection =  await db.collection('Admins')
    collection.updateOne({ _id: ObjectId(id) }, { $set: update })
    .then(result => {
      res.status(200).json(result)
    })
    .catch(err=>{
      res.status(500).json({error:"Failed Update"})
    })
  }else{
    res.status(500).json({ error: "Invalid ID" });
  }
});

app.put('/v1/api/Admins/:id',authenticateJWT, async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid admin ID' });
  }
  try {
      const update = {
          userName: req.body.userName,
          email: req.body.email,
          password: req.body.password
      };
      const result = await db.collection('Admins').updateOne(
          { _id: ObjectId(id) },
          { $set: update }
      );
      if (result.modifiedCount === 0) {
          return res.status(500).json({ error: 'Admin not found (\'.\'' });
      }
      res.status(200).json({ message: 'Admin updated successfully' });
  } catch (err) {
      console.error('Failed to update admin:', err);
      res.status(500).json({ error: 'Failed to update admin' });
  }
});


app.delete('/v1/api/Admins/:id',authenticateJWT, async (req , res) => {
  id = req.params.id
  if(ObjectId.isValid(id)){
    const collection = await db.collection('Admins')
    collection.deleteOne({_id : ObjectId(id)})
    .then(result => {
      res.status(204).json(result)
    })
    .catch(err => {
      res.status(500).json({error:"Failed delete"})
    })
  }else{
    res.status(500).json({ error: "Invalid ID" });
  }
});


/////////// Customers //////////////
app.get('/v1/api/Customers',authenticateJWT, async (req, res) => {
  try {
    let arr = [] 
    const Customers = await db.collection("Customers").find({}).sort({userName : 1}).toArray();
    arr = arr.concat(Customers)
    res.json({"Customers": Customers});
  } catch (err) {
    console.error('Failed to retrieve Customers:', err);
    res.status(200).json({ error: 'Failed to retrieve Customers' });
  }
});


app.post('/v1/api/Customers' ,authenticateJWT, async (req , res) => {
  try{
   const Customers = req.body;
   await db.collection("Customers").insertOne(Customers).then(result => {
     res.status(201).json(result)
   })
  }catch (err) {
   console.error('Failed to insert Customers:', err);
   res.status(500).json({ error: 'Failed to retrieve Customers' });
 }
 });


app.patch('/v1/api/Customers/:id',authenticateJWT ,  async (req , res) => {
  const update = req.body
   const id = req.params.id;
  if(ObjectId.isValid(id)){
    let collection =  await db.collection('Customers')
    collection.updateOne({ _id: ObjectId(id) }, { $set: update })
    .then(result => {
      res.status(200).json(result)
    })
    .catch(err=>{
      res.status(500).json({error:"Failed Update"})
    })
  }else{
    res.status(500).json({ error: "Invalid ID" });
  }
});

app.put('/v1/api/Customers/:id', authenticateJWT, async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
  }
  try {
      const update = {
          userName: req.body.userName,
          email: req.body.email
      };
      const result = await db.collection('Customers').updateOne(
          { _id: ObjectId(id) },
          { $set: update }
      );
      if (result.modifiedCount === 0) {
          return res.status(404).json({ error: 'Customer not found' });
      }
      res.status(200).json({ message: 'Customer updated successfully' });
  } catch (err) {
      console.error('Failed to update customer:', err);
      res.status(500).json({ error: 'Failed to update customer' });
  }
});


app.delete('/v1/api/Customers/:id',authenticateJWT , async (req , res) => {
  id = req.params.id
  if(ObjectId.isValid(id)){
    const collection = await db.collection('Customers')
    collection.deleteOne({_id : ObjectId(id)})
    .then(result => {
      res.status(204).json(result)
    })
    .catch(err => {
      res.status(500).json({error:"Failed delete"})
    })
  }else{
    res.status(500).json({ error: "Invalid ID" });
  }
});
///////// Products /////////////



app.get('/v1/api/Products', authenticateJWT,async (req, res) => {
  try {
    let arr = [] 
    const Products = await db.collection("Products").find({}).sort({productName: 1}).toArray();
    arr = arr.concat(Products)
    res.json({"Products": Products});
  } catch (err) {
    console.error('Failed to retrieve Products:', err);
    res.status(200).json({ error: 'Failed to retrieve Products' });
  }
});


app.post('/v1/api/Products' ,authenticateJWT, async (req , res) => {
  try{
   const Customers = req.body;
   await db.collection("Products").insertOne(Customers).then(result => {
     res.status(201).json(result)
   })
  }catch (err) {
   console.error('Failed to insert Products:', err);
   res.status(500).json({ error: 'Failed to retrieve Products' });
 }
 });


app.patch('/v1/api/Products/:id' , authenticateJWT, async (req , res) => {
  const update = req.body
   const id = req.params.id;
  if(ObjectId.isValid(id)){
    let collection =  await db.collection('Products')
    collection.updateOne({ _id: ObjectId(id) }, { $set: update })
    .then(result => {
      res.status(200).json(result)
    })
    .catch(err=>{
      res.status(500).json({error:"Failed Update"})
    })
  }else{
    res.status(500).json({ error: "Invalid ID" });
  }
});


app.put('/v1/api/Products/:id', authenticateJWT, async (req, res) => {
  const productId = req.params.id;
  if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID!' });
  }
  try {
      const update = {
          productName: req.body.productName,
          category: req.body.category,
          price: req.body.price
      };
      const result = await db.collection('Products').updateOne(
          { _id: ObjectId(productId) },
          { $set: update }
      );
      if (result.modifiedCount === 0) {
          return res.status(404).json({ error: 'Product not found ! ' });
      }
      res.status(200).json({ message: 'Product updated successfully ("….") ' });
  } catch (err) {
      console.error('Failed to update product:', err);
      res.status(500).json({ error: 'Failed to update product' });
  }
});


app.delete('/v1/api/Products/:id' ,authenticateJWT, async (req , res) => {
  id = req.params.id
  if(ObjectId.isValid(id)){
    const collection = await db.collection('Products')
    collection.deleteOne({_id : ObjectId(id)})
    .then(result => {
      res.status(204).json(result)
    })
    .catch(err => {
      res.status(500).json({error:"Failed delete"})
    })
  }else{
    res.status(500).json({ error: "Invalid ID" });
  }
});


////////////////////////////////







app.use(express.json())




