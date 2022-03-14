    require('dotenv').config();
const express =  require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const PORT = process.env.PORT || 3000
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const MongoDbStore = require('connect-mongo')(session)
const passport = require('passport');
const Emitter = require('events')

// Database connection
const MONGO_CONNECTION_URL="mongodb://localhost/khaba-naki"

mongoose.connect(MONGO_CONNECTION_URL, {  useUnifiedTopology: true});
const connection = mongoose.connection;


try{
    connection.once('open', () => {
        console.log("MongoDB database connection established successfully");
    })
    } catch(e) {
    console.log(e);
    }


// session store
let mongoStore = new MongoDbStore({
   mongooseConnection: connection,
   collection: 'sessions'


})

// Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)

// Session confih
app.use(session({
   secret: process.env.COOKIE_SECRET,
   resave: false,
   store: mongoStore,
   saveUninitialized: false,
   SameSite : true,
 
   
 
   cookie: { 
       maxAge: 1000 * 60 * 60 * 24,
      
       Secure:true
    }


}))

//Passport config
const passportInit = require('./app/config/passport');
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash());
//Assets

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false}))
app.use(express.json());

//Global middleware 

app.use((req , res , next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    
  

    next()
})



// set Template engine 
app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine','ejs');



require('./routes/web')(app);

const server = app.listen(PORT, () => {

    console.log(`listening on port ${PORT}`)
})


// Scoket 

const io =  require('socket.io')(server)

io.on('connection' , (socket) =>{

    // Join 
    console.log(socket.id)

    socket.on('join',(orderId) => {

        console.log(orderId)
        socket.join(orderId)
    })
})

eventEmitter.on('orderUpdated',(data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('paymentUpdated',(data) => {
    io.to(`order_${data.id}`).emit('paymentUpdated', data)
})

eventEmitter.on('orderPlaced', (data) =>  {

    io.to('adminRoom').emit('orderPlaced', data)
})