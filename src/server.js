require('dotenv').config()
const express = require('express')
const chalk = require('chalk');
const db = require("./db");
const dbsetup = require("./db/dbsetup")
const path = require('path');
const app = express();
const cors = require('cors');
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));


require('./routes')(app);
const dir = path.join(__dirname, 'static');
app.use('/static', express.static(dir));
app.use(require("./cors/middleware").checkToken);

//Starting The Whole App
(async ()=>{

  //Conecting to database
  try{
    const Message = await db.connect({
      user:process.env.DATABASE_USER,
      host:process.env.DATABASE_HOST,
      database:process.env.DATABASE_DATABASE,
      password:process.env.DATABASE_PASSWORD,
      port:process.env.DATABASE_PORT
    })
    console.log(chalk.greenBright.bold(Message));
    console.log(chalk.greenBright.bold(await dbsetup.setup()));
    //If connected Listing to the port
    app.listen(port,(err)=>{
      console.log(chalk.greenBright.bold(`App is listening on port ${port}`));
    });
  }
  catch(err){
    console.log(err);
  }
})();