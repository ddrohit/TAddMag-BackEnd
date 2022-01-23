require('dotenv').config()
const express = require('express')
const chalk = require('chalk');
const db = require("./src/db");
const dbsetup = require("./src/db/dbsetup")
const path = require('path');
const app = express();
const cors = require('cors');
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));


/**
 * @name Telangana_Ad_Mag
 * @file This is the Starting point
 * @author Rohit Dasamantharao
 * @version 1
 */


require('./src/routes')(app);
const dir = path.join(__dirname, 'static');
app.use('/static', express.static(dir));

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