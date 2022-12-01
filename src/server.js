import express from "express";
import configViewEngine from "./configs/viewEngine";
import db from "./configs/connectDB";
import initUserRoute from "./routes/apiUser";
import initFacilityRoute from "./routes/apiFacility";
import initHomeRoute from "./routes/apiHome";
import initFilterRoute from "./routes/apiFilter";
import initTestRoute from "./routes/apiTest";



require("dotenv").config();
const app = express();
const port = process.env.PORT || 8080;

configViewEngine(app);

// connect database
db.connectDB();

// set config receive data from form
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// router User
initUserRoute(app);
initFacilityRoute(app);
initHomeRoute(app);
initFilterRoute(app);
initTestRoute(app);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
