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

// WYKRYWANIE SYSTEMU (2–16) Z PRIORYTETEM NA HEX (16), GDY SĄ LITERY
function detectSuggestedBase(str) {
    str = str.trim().toUpperCase();
    if (!str) return null;

    // Dopuszczalne znaki tylko 0–9 i A–F
    if (!/^[0-9A-F]+$/.test(str)) return null;

    let maxVal = 0;
    let hasLetter = false;

    for (let ch of str) {
        let val;
        if (ch >= '0' && ch <= '9') {
            val = ch.charCodeAt(0) - 48;      // '0' = 48
        } else {
            val = ch.charCodeAt(0) - 55;      // 'A' = 65 → 10
            hasLetter = true;
        }
        if (val > maxVal) maxVal = val;
    }

    let minBase = Math.max(maxVal + 1, 2);

    // Ograniczenie do 2–16
    if (minBase > 16) return null;

    // Jeśli są litery A–F → zazwyczaj chodzi o HEX
    if (hasLetter) {
        return 16; 
    }

    // Bez liter – minimalna możliwa podstawa
    return minBase;
}

// Automatyczne podpowiadanie systemu – ZAWSZE NADPISUJEMY
document.addEventListener("DOMContentLoaded", () => {
    const numberInputs = document.querySelectorAll(".number");
    const baseInputs = document.querySelectorAll(".base");

    numberInputs.forEach((input, index) => {
        const baseInput = baseInputs[index];

        input.addEventListener("input", () => {
            const suggestion = detectSuggestedBase(input.value);

            if (suggestion !== null) {
                // ZAWSZE ustawiamy wykryty system, nawet jeśli coś już było wpisane
                baseInput.value = suggestion;
            }
            // jeśli suggestion == null, nie tykamy pola systemu
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
        let numStr = numbers[i].value.trim().toUpperCase();
        let base = parseInt(bases[i].value);

        // WALIDACJA PODSTAWY
        if (!numStr || isNaN(base) || base < 2 || base > 16) {
            showMessage("danger", `Nieprawidłowa liczba lub system w panelu <b>${i + 1}</b> (dozwolone systemy: 2–16).`);
            document.getElementById("output").style.display = "none";
            return;
        }

        // WALIDACJA ZNAKÓW
        if (!/^[0-9A-F]+$/.test(numStr)) {
            showMessage("danger", `Ciąg "<b>${numStr}</b>" zawiera niedozwolone znaki dla systemów 2–16.`);
            document.getElementById("output").style.display = "none";
            return;
        }

        // Sprawdzenie, czy wszystkie cyfry mieszczą się w podstawie
        for (let ch of numStr) {
            let val = (ch >= '0' && ch <= '9')
                ? ch.charCodeAt(0) - 48
                : ch.charCodeAt(0) - 55;

            if (val >= base) {
                showMessage("danger", `Znak "<b>${ch}</b>" nie może wystąpić w systemie <b>${base}</b>.`);
                document.getElementById("output").style.display = "none";
                return;
            }
        }

        let decimal = parseInt(numStr, base);
        decimalNumbers.push(decimal);
        outputText += `${i + 1}: <b>${decimal}</b><br>`;
    }

    let result = decimalNumbers.reduce((acc, val) => acc & val);
    outputText += `<br>Kod dostępu: <b>${result}</b>`;

    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = outputText;
    outputDiv.style.display = "block";
}
