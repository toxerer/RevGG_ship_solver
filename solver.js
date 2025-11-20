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


function detectSuggestedBase(str) {
    str = str.trim().toUpperCase();
    if (!str) return null;

    // Dozwolone znaki: 0–9, A–F
    if (!/^[0-9A-F]+$/.test(str)) return null;

    let maxVal = 0;
    const letters = new Set();

    for (let ch of str) {
        let val;
        if (ch >= '0' && ch <= '9') {
            val = ch.charCodeAt(0) - 48; // '0' = 48
        } else {
            val = ch.charCodeAt(0) - 55; // 'A' = 65 → 10
            letters.add(ch);
        }
        if (val > maxVal) maxVal = val;
    }

    let minBase = Math.max(maxVal + 1, 2);
    if (minBase > 16) return null;

    const hasOnlyA = (letters.size === 1 && letters.has('A'));
    const hasEorF = letters.has('E') || letters.has('F');

    // 1) Szukamy podstaw, które dają 6-cyfrowy wynik w systemie 10
    //    i są > 900000 (czyli zakres 900000–999999)
    const sixDigitCandidates = [];
    for (let base = minBase; base <= 16; base++) {
        const decimal = parseInt(str, base);

        // tylko 6 cyfr i > 900000
        if (decimal >= 900000 && decimal <= 999999) {
            sixDigitCandidates.push({ base, decimal });
        }
    }

    if (sixDigitCandidates.length > 0) {
        const bases = sixDigitCandidates.map(c => c.base);

        // Jeśli wśród kandydatów jest 16 → preferujemy 16 (klasyczny HEX)
        if (bases.includes(16)) {
            return 16;
        }

        // Jeśli jedyną literą jest A i wśród kandydatów jest 15 → preferujemy 15
        if (hasOnlyA && bases.includes(15)) {
            return 15;
        }

        // W pozostałych przypadkach – najmniejsza możliwa podstawa
        return Math.min(...bases);
    }

    // 2) Jeżeli żadna podstawa nie daje 6-cyfrowego wyniku > 900000,
    // używamy prostszych heurystyk:

    if (hasEorF) {
        return 16;
    }

    if (hasOnlyA && minBase <= 15) {
        return 15;
    }

    // Domyślnie: minimalna możliwa podstawa
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
                // ZAWSZE ustawiamy wykryty system
                baseInput.value = suggestion;
            }
            // jeśli suggestion == null, nie zmieniamy pola systemu
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

        // Walidacja podstawy
        if (!numStr || isNaN(base) || base < 2) {
            showMessage("danger", `Nieprawidłowa liczba lub system w panelu <b>${i + 1}</b>.`);
            document.getElementById("output").style.display = "none";
            return;
        }

        // Sprawdzenie, czy wszystkie cyfry mieszczą się w podanym systemie
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

        // ZASADA: liczba w systemie 10 musi być 6-cyfrowa
        if (decimal < 100000 || decimal > 999999) {
            showMessage(
                "danger",
                `Liczba w panelu <b>${i + 1}</b> po zamianie na system dziesiętny (${decimal}) nie jest 6-cyfrowa.`
            );
            document.getElementById("output").style.display = "none";
            return;
        }

        decimalNumbers.push(decimal);
        outputText += `${numStr} -> <b>${decimal}</b><br>`;
    }

    let result = decimalNumbers.reduce((acc, val) => acc & val);
    outputText += `<br>Kod dostępu: <span style="font-size: 20px;"><b>${result}</b></span>`;

    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = outputText;
    outputDiv.style.display = "block";
}



