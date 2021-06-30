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
# How to hide the ID. This will hide the ID, in our response, but the iD will be available in the database.
```
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    toJSON(){
      return { ...this.get(), id: undefined }
    }
  }
```

## Make sure that changes made to the models are also made to the migrations if you plan to leverage sequelize's db:migrate
## **On models/post.js**
```
  Post.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    body: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }
```
## **On migrations**
```
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("posts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      body: {
        type: DataTypes.STRING,
        allowNull: falses,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable("posts"); // changed to posts because our tablename is posts
  },
};
```

# Creating Associations
## A user can have many posts. In our posts model file, we can define the association in the static associate function.
```
    static associate(models) {
      // define association here
      // Since models holds every model, we can destructure.
    }
    - into -
    static associate({User}) {
      // define association here
      this.belongsTo(User)
    }
```
## Be default if you don't pass in the foreign key for Post to look for, it'll look for UserId.
## We can leverage {foreignkey: 'userId'}
## Can pass in the foreignkey AS userId instead.
```
    static associate({User}) {
      // define association here
      this.belongsTo(User, { foreignKey: 'userId' })
    }
```
# Eager Loading
## Examine this
```
const posts = await Post.findAll();
```
## Our express route handler returns json that is then available to see on Postman.
## Suppose we wanted to get the User as well.
```
    [
    {
        "uuid": "75abe359-8a53-444f-9332-dcaa41171062",
        "body": "This is a new post",
        "createdAt": "2021-06-30T05:40:55.870Z",
        "updatedAt": "2021-06-30T05:40:55.870Z"
    },
    {
        "uuid": "f19e1973-0fa4-43d9-9808-666a6470f54a",
        "body": "Second Post",
        "createdAt": "2021-06-30T05:43:06.787Z",
        "updatedAt": "2021-06-30T05:43:06.787Z"
    }
    ]
```
## Here's how we can do so
```
    const posts = await Post.findAll( {
        include: ['user']
    });
    OR
    const posts = await Post.findAll( {
        include: ['user']
    }); // if one user.
```
## **NOTE. This only works if our child belongs to the Parent and has used the 'as' property to explicitly define the relationship**
```
      this.belongsTo(User, {foreignKey:'userId', as: 'user'});

```
# Validation
## The validation applies before the SQL query is run.
## Link -> https://sequelize.org/master/manual/validations-and-constraints.html
```
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'User must have a name.'},
          notEmpty: { msg: 'Name must not be empty.'},
        }
      },
```
## Provides a way to ensure data fits a certain criterion. With message we can display on error, the issue with the input. - Error Message in errors.message.

# Full CRUD. Check out .put and .delete
```
app.delete("/users/:uuid", async (req, res) => {
  const uuid = req.params.uuid;
  try {
    const user = await User.findOne({ where: { uuid } });
    await user.destroy();
    return res.json({ message: "User deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

app.put("/users/:uuid", async (req, res) => {
  const uuid = req.params.uuid;
  const { name, email, role } = req.body;
  try {
    const user = await User.findOne({ where: { uuid } });

    user.name = name;
    user.email = email;
    user.role = role;

    await user.save();
    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});
```