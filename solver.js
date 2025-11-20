// Pokazywanie ładnych alertów Bootstrap
function showMessage(type, text) {
    const msgBox = document.getElementById("msgBox");
    msgBox.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${text}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

// WYKRYWANIE PROPONOWANEGO SYSTEMU LICZBOWEGO NA PODSTAWIE CIĄGU
function detectSuggestedBase(str) {
    str = str.trim().toUpperCase();
    if (!str) return null;

    // Jeśli są znaki spoza 0-9A-Z, nie sugerujemy nic
    if (!/^[0-9A-Z]+$/.test(str)) {
        return null;
    }

    // Najpierw proste heurystyki na popularne systemy
    if (/^[01]+$/.test(str)) {
        return 2;   // tylko 0 i 1
    }
    if (/^[0-7]+$/.test(str)) {
        return 8;   // cyfry 0-7
    }
    if (/^[0-9]+$/.test(str)) {
        return 10;  // tylko cyfry dziesiętne
    }
    if (/^[0-9A-F]+$/.test(str)) {
        return 16;  // klasyczny hex
    }

    // Ogólny przypadek: minimalna podstawa wynikająca z najwyższego symbolu
    let maxVal = 0;
    for (let ch of str) {
        let val;
        if (ch >= '0' && ch <= '9') {
            val = ch.charCodeAt(0) - '0'.charCodeAt(0);
        } else {
            val = ch.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
        }
        if (val > maxVal) maxVal = val;
    }

    let minBase = Math.max(maxVal + 1, 2);
    if (minBase > 36) return null; // poza zakresem, który obsługuje parseInt

    return minBase;
}

// Podpinamy nasłuchiwanie wpisywania w panele,
// żeby sugerować system liczbowy w sąsiednim inputcie
document.addEventListener("DOMContentLoaded", () => {
    const numberInputs = document.querySelectorAll(".number");
    const baseInputs = document.querySelectorAll(".base");

    numberInputs.forEach((input, index) => {
        const baseInput = baseInputs[index];

        input.addEventListener("input", () => {
            const suggestion = detectSuggestedBase(input.value);
            // Podpowiadamy tylko, jeśli pole systemu jest puste,
            // żeby nie nadpisywać świadomie wpisanej wartości
            if (suggestion !== null && baseInput.value.trim() === "") {
                baseInput.value = suggestion;
            }
        });
    });
});

function calculate() {
    const numbers = document.querySelectorAll(".number");
    const bases = document.querySelectorAll(".base");
    let decimalNumbers = [];
    let outputText = "";

    // Czyścimy stare komunikaty
    document.getElementById("msgBox").innerHTML = "";

    for (let i = 0; i < numbers.length; i++) {
        let numStr = numbers[i].value.trim();
        let base = parseInt(bases[i].value);

        // Walidacja
        if (!numStr || isNaN(base) || base < 2 || base > 36) {
            showMessage("danger", `Nieprawidłowa liczba lub system w panelu <b>${i + 1}</b>.`);
            document.getElementById("output").style.display = "none";
            return;
        }

        let decimal = parseInt(numStr, base);
        if (isNaN(decimal)) {
            showMessage("danger", `Nie udało się zamienić liczby "<b>${numStr}</b>" w systemie <b>${base}</b>.`);
            document.getElementById("output").style.display = "none";
            return;
        }

        decimalNumbers.push(decimal);
        outputText += `${i + 1}: <b>${decimal}</b><br>`;
    }

    let result = decimalNumbers.reduce((acc, val) => acc & val);
    outputText += `<br>Kod dostępu: <b>${result}</b>`;

    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = outputText;
    outputDiv.style.display = "block"; 
}
