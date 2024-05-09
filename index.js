import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

const app = express();
const port = 3000;
const saltRounds = 10;



let userID = 0 ;



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


async function userInfo(id){


const result = await db.query("SELECT * FROM userList WHERE userID = $1",[id])

let notes = []

console.log(result)
result.rows.forEach((item) =>{ item.notes} )
return userLists
}

let dbResult = await db.query("SELECT * FROM users")
let users  = dbResult.rows

app.get("/lists",async (req, res) => {


  const result = await db.query("SELECT * FROM userlist WHERE userid = $1 ;",[userID])

const data = result.rows

// console.log(userID + "userId")
// console.log(data)

const userData = {user:data.id,
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
     const result = await db.query(
        "INSERT INTO users (email, password) VALUES ($1, $2)",
        [email, hash]
      );
      // console.log(result);
      res.render("lists.ejs");
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
userID = user.id
      const storedHashedPassword = user.password;
bcrypt.compare(loginPassword,storedHashedPassword, (err,result)=>{
  if(err){
    console.log('error hasing:', err)
  }

  else{

    if(result){
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
const id = req.body.user


console.log(id)
// if(title.length > 0){

//   console.log(userID)
// await db.query("INSERT INTO userlist (title, notes, userid) VALUES ($1,$2,$3)",[title,notes,userID])
// }
  

  res.redirect("/lists");
});




app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
