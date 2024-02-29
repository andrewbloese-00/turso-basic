export function groupBy(arrOfObjects, key) {
  const grouped = {};
  for (let i = 0; i < arrOfObjects.length; i++) {
    if (!arrOfObjects[i][key]) continue;
    const group = arrOfObjects[i][key];
    if (!grouped[group]) grouped[group] = [];
    let payload = {};
    for (let _key in arrOfObjects[i]) {
      if (_key !== key) payload[_key] = arrOfObjects[i][_key];
    }
    grouped[group].push(payload);
  }
  return grouped;
}
