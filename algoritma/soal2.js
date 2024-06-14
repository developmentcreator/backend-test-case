function longest(sentence) {
  // Pisahkan kalimat menjadi array kata-kata
  const words = sentence.split(" ");

  // Temukan kata terpanjang
  let longestWord = "";

  for (let word of words) {
    if (word.length > longestWord.length) {
      longestWord = word;
    }
  }

  // Kembalikan kata terpanjang beserta panjangnya
  return `${longestWord}: ${longestWord.length} characters`;
}

const sentence = "Saya sangat senang belajar bahasa pemograman javascript";
console.log(longest(sentence)); // Output: "pemograman: 10 characters"
