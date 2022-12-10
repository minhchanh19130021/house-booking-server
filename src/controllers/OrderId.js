import Order from "../models/Order";
var data = async function () {
    var array = [];
    const finalResults = await new Promise((resolve, reject) => {
        Order.find({}).toArray(function (err, result) {
            resolve(result);
        });
    });

    for (var i = 0; i < finalResults.length; i++) {
        var a = finalResults[i].name;
        array.push(a);
    }
    return array;
};

module.exports = {
    data: data,
};