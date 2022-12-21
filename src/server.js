
import express from "express";
import configViewEngine from "./configs/viewEngine";
import db from "./configs/connectDB";
import initUserRoute from "./routes/apiUser";
import initFacilityRoute from "./routes/apiFacility";
var cookieParser = require("cookie-parser");
// var cors = require("cors");
import initHomeRoute from "./routes/apiHome";
import initFilterRoute from "./routes/apiFilter";
import initReviewRoute from "./routes/apiReview";
import initTestRoute from "./routes/apiTest";
import initHistoryBooking from "./routes/apiHistoryBooking";
import initOrderRoute from "./routes/apiOrder";
import initOrdersDetailsRoute from "./routes/apiOrdersDetails";
import initCartRoute from "./routes/apiCart";
import homesRoute from "./routes/home.js";


// import useFetch from "./hooks/useFetch";
var cors = require('cors');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

configViewEngine(app);

// connect database
db.connectDB();

// set config receive data from form
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// router User
initUserRoute(app);
initReviewRoute(app)
initHistoryBooking(app);
// router list home
initOrderRoute(app);
initFacilityRoute(app);
initHomeRoute(app);
initFilterRoute(app);
// router Test
initTestRoute(app);
// router cart
initCartRoute(app);

initOrderRoute(app);
initOrdersDetailsRoute(app)
app.use("/api/homes", homesRoute);



//PAYPAL

app.set('view engine', 'ejs');
paypal.configure({
    mode: 'sandbox', //sandbox or live
    client_id: 'AccNmmQTj1g1S2u5esdS_1TtTvYW3GDL1SBU76CvFwAjmGEIGYFfUtOFUn-tt852I2EWLHXdbQoBDpjY',
    client_secret: 'EJzyuhAVwzhILptlnm29NZdhrgjj_ffY4QspLg6p4t_9KOxAPQSUtZT-e8fUyAzrw1wx0eM7IaajMtcH',
});

// app.get('/', (req, res) => res.render('index'));
// const { data, loading, error } = useFetch(`/api/homes/find/636ce065825a1cd1940641a2`);
app.post('/pay/:id/:name/:price/:totalPirce/:pricePoint/:description', (req, res) => {
    const id = req.params.id;
    const name = req.params.name;
    const totalPirce = req.params.totalPirce;
    const description = req.params.price;
    const price = req.params.price;
    const pricePoint = req.params.pricePoint;

    const create_payment_json = {
        intent: 'sale',
        payer: {
            payment_method: 'paypal',
        },
        redirect_urls: {
            return_url: 'http://localhost:3000/payment/success',
            cancel_url: 'http://localhost:3000/payment',
        },  

        "transactions": [{
            "item_list": {
                "items": [{
                    "name": name,
                    "sku": id,
                    "price": price,
                    "currency": "USD",
                    "quantity": 1
                },{
                    "name": "Phí phục vụ",
                    "sku": "PPV123",
                    "price": (350000*0.00004).toFixed(2),
                    "currency": "USD",
                    "quantity": 1
                },{
                    "name": "Phí vệ sinh",
                    "sku": "PVS123",  
                    "price": (100000*0.00004).toFixed(2),
                    "currency": "USD",
                    "quantity": 1
                },{
                    "name": "Điểm tích lũy",
                    "sku": "PVS123",  
                    "price": -pricePoint,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD", 
                "total": totalPirce 
            },
            "description": description
        }] 

    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        const id = req.query.id;
        const name = req.query.name;
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
});

app.get('/home', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        payer_id: payerId,
        transactions: [
            {
                amount: {
                    currency: 'USD',
                    total: '25.00',
                },
            },
        ],
    };
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success (Mua hàng thành công)');
        }
    });
});

app.get('/cancel', (req, res) => res.send('Cancelled (Đơn hàng đã hủy)'));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
  