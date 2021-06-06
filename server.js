require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');

const user = require('./routers/user.router')
const category = require('./routers/categories.router');
const upload = require('./routers/upload.router');
const product = require('./routers/product.route')
const checkout = require('./routers/checkout.route')
const payment = require('./routers/payment.route')
const discount = require('./routers/discounts.route');

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on("connection", (socket) => {
    console.log(socket.id + 'connected')
    socket.on('test', (data) => {
        console.log(data);
    })
    socket.on("client-sent-data", (data) => {
        // console.log(data, 'x1');
        io.sockets.emit("server-sent-data", data.msg);
    })
    socket.on("add-product", (data) => {
        console.log(data, 'x2');
        io.sockets.emit("add-product", data);
    })
    socket.on("deleteDiscount", (data) => {
        console.log(data, 'x3');
        io.sockets.emit("deleteDiscount", data);
    })
    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnect');
    })
});
// io.on("connection", (socket) => {
// socket.on("client-sent-data", (data) => {
//     console.log(data, 'x1');
//     io.sockets.emit("server-sent-data", data.msg);
// })
// socket.on("add-product", (data) => {
//     console.log(data, 'x2');
//     io.sockets.emit("add-product", data);
// })
//     socket.on('disconnect', (reason) => {
//         console.log("disconnect");
//     });
// });

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(fileUpload({
    useTempFiles: true
}));
//Routes
app.use('/user', user);
app.use('/category', category);
app.use('/images', upload);
app.use('/products', product);
app.use('/checkout', checkout);
app.use('/payment', payment);
app.use('/discounts', discount)





//connect to mongoDB
mongoose
    .connect(process.env.URL_MONGODB, {
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => console.error(`Connection failed...`)
    );

app.get('/', (req, res) => {
    res.json('test');
})


const PORT = process.env.PORT || 8000
http.listen(PORT, () => {
    console.log('server is running on port', PORT);
})