export function extractPrice(...elements: any){
  for (const element of elements) {
    const priceText = element.text().trim();

    if(priceText) return priceText.replace(/[^\d.]/g, '')
  }

  return ''
}

// export function extractCurrency(element: any) {
//   const currencyText = element.text().trim().slice(0, 1);
//   return currencyText ? currencyText : '';
// }

export function extractCurrency(element: any) {
  const currencyText = element.text().trim();
  // Function to find the smallest repeating unit in a string
  function findRepeatingUnit(str: string) {
    for (let i = 1; i <= str.length / 2; i++) {
      let unit = str.substring(0, i);
      if (str === unit.repeat(str.length / unit.length)) {
        return unit;
      }
    }
    return str; // Return the whole string if no repeating pattern is found
  }

  return findRepeatingUnit(currencyText);
}