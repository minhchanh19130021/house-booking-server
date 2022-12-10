import express from "express";
import configViewEngine from "./configs/viewEngine";
import db from "./configs/connectDB";
import initUserRoute from "./routes/apiUser";
import initFacilityRoute from "./routes/apiFacility";
var cookieParser = require("cookie-parser");
var cors = require("cors");
import initHomeRoute from "./routes/apiHome";
import initFilterRoute from "./routes/apiFilter";
import initReviewRoute from "./routes/apiReview";
import initTestRoute from "./routes/apiTest";
import initHistoryBooking from "./routes/apiHistoryBooking";


require("dotenv").config();

const app = express();
const port = process.env.PORT || 8080;

configViewEngine(app);

// connect database
db.connectDB();

// set config receive data from form
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
// router User
initUserRoute(app);
initReviewRoute(app)
initHistoryBooking(app);
// router list home
initFacilityRoute(app);
initHomeRoute(app);
initFilterRoute(app);
// router Test
initTestRoute(app);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
