function countOccurrences(INPUT, QUERY) {
  // Buat array untuk menyimpan hasil
  let result = [];

  // Iterasi melalui setiap kata dalam QUERY
  for (let queryWord of QUERY) {
    // Hitung berapa kali kata tersebut muncul dalam INPUT
    let count = 0;
    for (let inputWord of INPUT) {
      if (inputWord === queryWord) {
        count++;
      }
    }
    // Simpan hasilnya dalam array result
    result.push(count);
  }

  return result;
}

const INPUT = ["xc", "dz", "bbb", "dz"];
const QUERY = ["bbb", "ac", "dz"];

const OUTPUT = countOccurrences(INPUT, QUERY);
console.log(OUTPUT); // Output: [1, 0, 2]
