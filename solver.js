function calculate() {
    const numbers = document.querySelectorAll(".number");
    const bases = document.querySelectorAll(".base");
    let decimalNumbers = [];
    let outputText = "";

    for (let i = 0; i < numbers.length; i++) {
        let numStr = numbers[i].value.trim();
        let base = parseInt(bases[i].value);

        if (!numStr || isNaN(base) || base < 2 || base > 36) {
            alert(`Nieprawidłowa liczba lub system w panelu ${i+1}`);
            return;
        }

        let decimal = parseInt(numStr, base);
        if (isNaN(decimal)) {
            alert(`Nie udało się zamienić liczby "${numStr}" w systemie ${base}`);
            return;
        }

        decimalNumbers.push(decimal);
        outputText += `${i+1}: ${decimal}<br>`;
    }

    let result = decimalNumbers.reduce((acc, val) => acc & val);
    outputText += `<br>Kod dostępu: <b>${result}</b>`;

const outputDiv = document.getElementById("output");
outputDiv.innerHTML = outputText;
outputDiv.style.display = "block"; // pokazujemy wynik
}






