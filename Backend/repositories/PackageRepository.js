const Package = require("../../models/Package");
const { FREE_PACKAGE } = require("../Constants");

exports.validatePackage = async (packageName) => {
  const patientPackage = await this.getPackage(packageName);
  if (!patientPackage) {
    if (packageName.toLowerCase() == "free") {
      return FREE_PACKAGE;
    }
    const error = new Error("Package not found");
    error.statusCode = 404;
    throw error;
  }
  return patientPackage;
};

exports.getPackage = async (packageName) => {
  const patientPackage = await Package.findOne({
    name: packageName,
  });
  return patientPackage;
};

exports.getPackages = async (query = {}) => {
  const packages = await Package.find(query);
  return packages;
};

exports.createPackage = async (packageData) => {
  const patientPackage = new Package(packageData);
  await patientPackage.save();
  return patientPackage;
};

exports.updatePackage = async (packageName, packageData) => {
  const updatedPackage = await Package.findOneAndUpdate(
    { name: packageName },
    { $set: packageData },
    { new: true }
  );
  return updatedPackage;
};

exports.deletePackage = async (packageName) => {
  const deletedPackage = await Package.findOneAndDelete({
    name: packageName,
  });
  return deletedPackage;
};
