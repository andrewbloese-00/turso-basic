const MISMATCH_ERR = "Could not convert, row-column mismatch";
export const translateRow = (row, columns) => {
  let payload = {};
  for (let i = 0; i < columns.length; i++) {
    if (i > row.length) throw new Error(MISMATCH_ERR);
    payload[columns[i].toLowerCase()] = row[i];
  }
  return payload;
};
