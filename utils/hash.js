const fs = require('fs');
const jsonfile = require('jsonfile');
const hasha = require('hasha');
const request = require('request');

const bit = process.argv[2];
if (bit != 32 && bit != 64) {
  console.log('bit [1st argument] must be 32 or 64, yours is', bit || 'none');
  process.exit();
}
const key = bit + 'bit';
if (process.argv[3]) {
  hashIt(process.argv[3])
} else {
  fs.readdir('./nohash', (err, list) => {
    list.forEach(hashIt);
  })
}

function hashIt(file) {
  const name = file.match(/php-(.*).json$/)[1];
  const filePath = './nohash/' + file;
  jsonfile.readFile(filePath, (err, manifest) => {
    if(err) return console.error({err});
    setTimeout(function () {
      request(manifest.architecture[key].url)
        .on('error', function (err) {
          console.log('error geting', name, key);
          console.error({
            err
          });
        })
        .pipe(hasha.stream({
          algorithm: 'sha256'
        }))
        .on('data', hash => {
          manifest.architecture[key]['hash'] = hash;
          console.log('writing hash for ' + name, key, hash);
          jsonfile.writeFile(filePath, manifest, {
            spaces: 2
          }, err => {
            if (!err) return;
            console.error('cannot write to', filePath);
            console.error({
              err
            });
          });
        })
    }, 5000);

  })

}
