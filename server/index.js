const path = require('path');
const express = require('express');
const formidable = require('formidable');
const uuid = require('uuid');
const tar = require('tar');
const fs = require('fs-extra');
const getPackageManager = require('./src/getPackageManager');

const packageManager = getPackageManager(path.resolve('./package'), path.resolve('./persist/data.json'));

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE");
  next();
});

app.get('/', (req, res) => res.redirect('./ui/main/index.html'));
app.use('/ui', express.static(path.resolve('./ui')));

app.get('/targets', async (req, res) => {
  res.jsonp(await packageManager.getPackageInfo());
});
app.get('/targets/target', async (req, res) => {
  res.send(await packageManager.getSelectedPackage());
});
app.post('/targets/:target', async (req, res) => {
  const target = req.params.target;
  await packageManager.setSelectedPackage(target);
  res.send('ok');
});
app.delete('/targets/:target', async (req, res) => {
  const target = req.params.target;
  try {
    await packageManager.deletePackage(target);
    res.send('ok');
  }catch(e){
    console.log(e);
    res.status(400).jsonp({ error: 'Cannot delete package' });
  }
});


const getPackageNameFromTmpDirectory = tmpDirectory => new Promise((resolve, reject) => {
  fs.readFile(path.resolve(tmpDirectory, 'manifest.json'), (err, result) => {
    if (err){
      reject(err);
      return;
    }
    const info = JSON.parse(result);
    const name = info.name;
    resolve(name);
  })
});


const processRawPackage = async (tmp_upload_file, tmpDirectory) => {
  let isValid = true;

  await fs.mkdirp(tmpDirectory);
  await tar.x({
    file: tmp_upload_file,
    cwd: tmpDirectory,
  });

  const packageName = await getPackageNameFromTmpDirectory(tmpDirectory);

  const exists = await new Promise(resolve => fs.exists(path.resolve('package', packageName), exists => resolve(exists)));

  if (exists === false){
    await fs.copy(tmpDirectory, path.resolve('package', packageName));
  }else{
    isValid = false;
  }

  const deleteTmpUploadPromise  = new Promise((resolve, reject) => fs.unlink(tmp_upload_file, err => {
    if (err){
      reject(err);
      return;
    }
    resolve();
  }));

  await deleteTmpUploadPromise;
  await fs.remove(tmpDirectory);
  if (isValid === false){
    throw (new Error('package already exists'));
  }
};

app.post('/package', (req, res) => {
  const form = new formidable.IncomingForm();
  form.on('fileBegin', (name, file) => {
    file.path = path.resolve('./package_tmp', uuid());
  });

  form.parse(req, async (err, fields, files) => {
    try {
      await Promise.all(Object.keys(files).map(async fileName => {
        const filePath = files[fileName].path;
        return await processRawPackage(filePath, path.resolve('./package_unzip', path.basename(filePath)));
      }));
      res.send('ok');
    }catch(err){
      res.status(400).send('package already exists');
    }
  });
});



app.listen(3000);