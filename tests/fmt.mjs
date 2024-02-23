export const Divider = (text) => console.log(`* === ${text} === *`);
export const PASS = (testName, data) => {
  console.log(`${testName} PASSED ✅\n`, data ?? "NODATA");
  return true;
};

export const FAIL = (testName, err) => {
  console.log(`${testName} FAILED ❌\n`, err);
  return false;
};
