const request = require('request');
const hasha = require('hasha');
const jsonfile = require('jsonfile');
const fs = require('fs');
const cheerio = require('cheerio');

const statURL = 'https://pecl.php.net/package-stats.php';

request(statURL, (err, response, body) => {
    if (!body) return;
    const $ = cheerio.load(body);
    const table = $('#jabba table tr td:first-child');
    table.each(function () {
        let packageName = $(this).text();
        const packageSaveAs = './nohash/php-' + packageName + '.json';

        const packageURL = 'https://pecl.php.net/package/' + $(this).text();
        setTimeout(function () {
            request(packageURL, (err, response, body) => {
                if (!body) return;
                const versionMatch = new RegExp(packageName + '/([\\d.]+)/windows');
                const version = body.match(versionMatch);
                if (!version || !version[1] || !(/[\d.]+/).test(version[1])) {
                    return;
                }
                
                packageName = packageName.toLocaleLowerCase();

                const arcs = [64];
                arcs.forEach(arc => {
                    request.head(getDownloadURL(packageName, version[1], arc), (err, response, body) => {
                        if (err || !response || response.statusCode > 399) {
                            console.log(`canceling ${packageName} x${arc}:', ${response.statusCode}`)
                            return;
                        }
                        // replace package name 
                        let template = fs.readFileSync('./template').toString();
                        template = template.replace(/__package__/g, packageName);
                        // replace package version
                        template = template.replace(/__version__/g, version[1]);
                        fs.writeFileSync(packageSaveAs, template);
                        console.log(`saving ${packageName} x${arc}:', ${response.statusCode}`)

                    });
                });

            });
        }, 10000)
    });
});


function getDownloadURL(package, version, arc) {
    return `http://windows.php.net/downloads/pecl/releases/${package}/${version}/php_${package}-${version}-7.1-ts-vc14-x${arc}.zip`
}

// let uri;
// uri = 'http://windows.php.net/downloads/pecl/releases/mongodb/1.2.9/php_mongodb-1.2.9-7.1-ts-vc14-x64.zip';
// request(uri)
// .on('error', function(err) {
//     console.log(err)
//   })
//   .pipe(hasha.stream({algorithm: 'sha256'})).pipe(process.stdout)
/*
const package = process.argv[2];
const version = process.argv[3];
if (!package || !version) {
    return console.error('package and version should be on 1st and 2nd argument');
}
const file = './template';
fs.readFile(file, (err, data) => {
    console.log(data.toString().replace(/__package__/g, package).replace(/__version__/g, version));
});
// jsonfile.readFile(file, function (err, object) {
//     if (err) {
//         return console.error(err.message);
//     }
//     object.homepage = object.homepage.replace('__package__', package);
//     console.log(object.homepage)
// });
*/