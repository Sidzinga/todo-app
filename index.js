import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv"


const app = express();
const port = 3000;
const saltRounds = 10;



;

env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});


db.connect()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



let dbResult = await db.query("SELECT * FROM users")
let users  = dbResult.rows
let userID = 1


app.get("/lists",async (req, res) => {

  
  const result = await db.query("SELECT * FROM userlist WHERE userid = $1 ;",[userID])

const data = result.rows

console.log(userID + "userId")
console.log(data + " userData")

const userData = {user:userID,
  info:data
}


// console.log(checkUser(userID))


  res.render("lists.ejs",userData);
});


app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {

bcrypt.hash(password,saltRounds,async (err,hash)=>{ 

  if(err){
    console.log("error hashing password:",err)
  } else{
   await db.query(
        "INSERT INTO users (email, password) VALUES ($1, $2)",
        [email, hash]
      );

      const result = await db.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );
      console.log(result.rows[0].id);
      userID = result.rows[0].id
      res.redirect("/lists");
  }
  
})


     
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const loginPassword = req.body.password;


  try {


    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);



    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log(user)

console.log(userID)
      const storedHashedPassword = user.password;
bcrypt.compare(loginPassword,storedHashedPassword, (err,result)=>{
  if(err){
    console.log('error hasing:', err)
  }

  else{

    if(result){

      userID = user.id


      console.log(userID)
       res.redirect("/lists");
    }else {
        res.send("Incorrect Password");
      }
  }
})

    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});



app.post("/newList",async (req, res) => {
const title = req.body.title
const notes = req.body.notes
// const id = req.body.user
 
// userID = id


console.log(userID + ' HEY')

//  db.query("INSERT INTO userlist (title, notes, userid) VALUES ($1,$2,$3)",[title,notes,userID])
// }
  

  res.redirect("/lists");
});


app.post("/edit",async (req, res) => {
  const title = req.body.updatedItemTitle
  const notes = req.body.updatedItemNote
  // const id = req.body.user
   
  
   db.query("UPDATE userlist SET title = $1, notes = $2 WHERE title = $1",[title,notes])
  
    
  
    res.redirect("/lists");
  });
  



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
