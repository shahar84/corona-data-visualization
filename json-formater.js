const fs = require('fs');
const ObjectsToCsv = require('objects-to-csv');

const wantedFields = {
    'countrycode': 'code',
    'countrylabel': 'label',
    'totalcases': 'cases',
    'totaldeaths': 'deaths',
    'totalrecovered': 'recovered'
};

const filterCountries = (data, countries) => {
    return data.map(item => {
        const {date, data} = item;
        const obj = {
            date
        };
        obj['data'] = data.filter(item => countries.has(item['code']))
        return obj;
    });
};
const orderData = (data) => {
    const countries = new Set();
    const response = data.map(item => {
        const {date, data} = item;
        const obj = {
            date
        };
        obj['data'] = data.map(item => {
            const obj = {};
            Object.entries(wantedFields).forEach(([key, value]) => {
                obj[value] = item[key]
            });
            const patients = parseInt(obj['cases']) > 0 || parseInt(obj['deaths']) > 0;
            if (patients) countries.add(obj['code']);
            return obj
        });
        return obj
    });
    return filterCountries(response, countries);
};

const jsonToCsv = (json, key='deaths') => {
    return json.map(({data, date}) => {
        const obj = {
            date
        };
        data.forEach(country => {
            obj[country['label']] = country[key]
            // obj['Image URL'] = `https://www.countryflags.io/${country['code'].toLowerCase()}/flat/64.png`;
        });
        return obj
    });
};

fs.readFile('./dataset.json', (err, data) => {
    if (err) throw err;
    const json = JSON.parse(data);
    const orderedData = orderData(json)
    const csvData = jsonToCsv(orderedData);

    fs.writeFileSync('./dataset-formatted.json', JSON.stringify(orderedData, null, 2));

    (async () => {
        const csv = new ObjectsToCsv(csvData);
        await csv.toDisk('./dataset-formatted.csv');
        // Return the CSV file as string:
        console.log(await csv.toString());
    })();

});

