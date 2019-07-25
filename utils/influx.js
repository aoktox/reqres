const INFLUXDB_HOST = process.env.INFLUXDB_HOST || "localhost",
    INFLUXDB_DBNAME = process.env.INFLUXDB_DBNAME || "reqres",
    MEASUREMENT='requests';

const Influx = require('influx');

const influx = new Influx.InfluxDB({
    host: INFLUXDB_HOST,
    database: INFLUXDB_DBNAME,
    schema: [
        {
            measurement: MEASUREMENT,
            fields: {
                count: Influx.FieldType.INTEGER
            },
            tags: [
                'origin'
            ]
        }
    ]
});

function req_counter_save(client_ip) {
    influx.getDatabaseNames().then(names=>{
        if(!names.includes(INFLUXDB_DBNAME)){
            influx.createDatabase(INFLUXDB_DBNAME);
        }
    }).then(()=> do_write(client_ip));

}

function do_write(client_ip) {
    influx.writePoints([
        {
            measurement: MEASUREMENT,
            tags: {
                origin: client_ip
            },
            fields: {
                count: 1
            },
        }
    ])
}

function req_counter(req, res, next) {
    let client_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    req_counter_save(client_ip);
    next();
}

module.exports = { req_counter };