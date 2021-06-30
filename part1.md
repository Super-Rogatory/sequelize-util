# Creating a Database, Creating a model, Generating a table from the model

- Refer to notes from creating a database and a model.
- Creating a model
```
const sequelize = require('./models');

async function main(){
    await sequelize.sync();
}
main();
```
## **NOTE. If you don't pass anything to sync, it will only work once! If you need it to reset upon execution use, ({force: true});**
## You must import the sequelize module. Index.js is creating the database **model** for us, using the information given on sequelize model:generate.
## That database is being exported, we can then import it can call sync to create database tables contingent on our current models.

- Running node app.js will execute the main function to generate the necessary tables for us.

## Changing the name of the database. [create tableName property]
```
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    tableName: 'users',
    modelName: 'User',
  });
```

## Creating the table from the generate CLI model. This is an asynchronous action, and we need to import the model first.
```
const {sequelize, User} = require('./models'); // imports the User from models
...
...
...
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
```

## We can drop the table and rebuilt on every file execution. Since we have to await sequelize.sync, just like we did before, create an async callback function.
```
app.listen(5000, async () => {
    console.log('Server up on port 5000!');
    await sequelize.sync({force: true});
    console.log('Database synced');
});
```


## When we generate the user model, a migrations file is created.
```
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};
```
## **You might want to change the Table names from 'Users' to 'users'. Update properties, change Sequelize to DataValues.**

# We need to ensure that each time we run the app, we are not making permanent changes to the database (in dev mode).
```
app.listen(5000, async () => {
    console.log('Server up on port 5000!');
    await sequelize.authenticate(); // authenticate does not create the table like sync would, you must call sequelize db:migrate.
    console.log('Database connected!');
});
```
## Then. Run sequelize db:migrate after you have made the appropriate changes to the migrations file.