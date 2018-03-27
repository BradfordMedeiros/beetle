
const fs = require('fs-extra');

const readPackages = packageDirectory => new Promise((resolve, reject) => {
  fs.readdir(packageDirectory, (err, result) => {
    if (err){
      reject(err);
      return;
    }
    resolve(result);
  })

});
const readSelectedIndex = persistFile => new Promise((resolve, reject) => {
  fs.readFile(persistFile, (err, result) => {
    if  (err){
      reject(err);
      return;
    }
    resolve(JSON.parse(result).selectedIndex);
  })
});
const writeSelectedIndex = (persistFile, selectedIndex) => new Promise((resolve, reject) => {
  const data = JSON.stringify({
    selectedIndex,
  });
  fs.writeFile(persistFile, data, err => {
   if (err){
     reject(err);
     return;
   }
   resolve();
  })
});

const getPackageManager = (packageDirectory, persistFile) => {
  const getPackageInfo = async () => {
    const selectedPackage = await getSelectedPackage();
    return (await readPackages(packageDirectory)).map((packageName, index) => ({
      target: packageName,
      selected: packageName === selectedPackage,
    }));
  };

  const setSelectedPackage = async packageName => await writeSelectedIndex(persistFile, packageName);

  const getSelectedPackage = async () => {
    const selectedPackage = await readSelectedIndex(persistFile);
    return selectedPackage;
  };

  return ({
    getPackageInfo,
    setSelectedPackage,
    getSelectedPackage,
  })
};

module.exports = getPackageManager;