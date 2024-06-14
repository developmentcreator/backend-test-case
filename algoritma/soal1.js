function reverseAlphabets(str) {
  // Pisahkan string menjadi dua bagian: huruf dan angka
  let alphabets = "";
  let digits = "";

  for (let char of str) {
    if (isNaN(char)) {
      alphabets += char;
    } else {
      digits += char;
    }
  }

  // Balik urutan huruf
  let reversedAlphabets = alphabets.split("").reverse().join("");

  // Gabungkan huruf yang dibalik dengan angka
  let result = reversedAlphabets + digits;

  return result;
}

let input = "NEGIE1";
let output = reverseAlphabets(input);
console.log(output); // Output: "EIGEN1"
