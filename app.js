const express = require('express');
const app = express();
const morgan = require('morgan');
const {sequelize, User} = require('./models'); // imports the User from models

app.use(express.urlencoded({extended: false})); // parses and creates a readable req.body
app.use(morgan("dev")); // logger for terminal
app.use(express.json()); // parses the body if it's a json

app.post('/users', async(req,res) => {
    const {name, email, role} = req.body;
    try{
        const user = await User.create({name, email, role});
        return res.json(user);
    }catch(err){
        console.log(err);
        return res.status(500).json(err);
    }
});

app.listen(5000, async () => {
    console.log('Server up on port 5000!');
    await sequelize.authenticate(); // authenticate does not create the table like sync would, you must call sequelize db:migrate.
    console.log('Database connected!');
});
