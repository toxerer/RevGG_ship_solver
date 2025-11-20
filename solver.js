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

// WYKRYWANIE SYSTEMU (2–16) z zasadą "wynik w dziesiętnym ma być 6-cyfrowy"
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

    // 1) Dla podstaw 11–16 sprawdzamy, czy po konwersji do systemu 10
    // otrzymujemy 6-cyfrowy wynik. Jeśli tak – ta podstawa wygrywa.
    for (let base = Math.max(minBase, 11); base <= 16; base++) {
        const decimal = parseInt(str, base);
        if (decimal >= 100000 && decimal <= 999999) {
            return base; // "to jest jej system liczbowy"
        }
    }

    // 2) Jeżeli żadna z podstaw 11–16 nie daje 6-cyfrowego wyniku,
    // używamy prostszych heurystyk:

    if (hasEorF) {
        return 16;
    }

    if (hasOnlyA && minBase <= 15) {
        return 15;
    }

    // Domyślnie: minimalna możliwa podstawa (np. 2–10 albo >10, jeśli brak innych wskazówek)
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
        if (!numStr || isNaN(base) || base < 2 || base > 16) {
            showMessage("danger", `Nieprawidłowa liczba lub system w panelu <b>${i + 1}</b> (dozwolone systemy: 2–16).`);
            document.getElementById("output").style.display = "none";
            return;
        }

        // Walidacja znaków (tylko 0–9, A–F)
        if (!/^[0-9A-F]+$/.test(numStr)) {
            showMessage("danger", `Ciąg "<b>${numStr}</b>" zawiera niedozwolone znaki dla systemów 2–16.`);
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
        outputText += `${i + 1}: <b>${decimal}</b><br>`;
    }

    let result = decimalNumbers.reduce((acc, val) => acc & val);
    outputText += `<br>Kod dostępu: <b>${result}</b>`;

    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = outputText;
    outputDiv.style.display = "block";
}

