// projekt/data.js

// =============================================================================
// DUOMENYS - ČEIA KEISKITE VISUS DUOMENIS
// =============================================================================

const DATA = {
    // PAGALBOS TEKSTAI
    HELP: {
        DESCRIPTION: `DESCRIPTION laukas yra neprivalomas ir nurodo užduoties pavadinimą arba trumpą aprašymą.

Pavyzdžiai:
- "Parašyti savaitės ataskaitą"
- "Nusipirkti produktus"
- "Paskambinti daktarui"
- "Revit: atsisiųsti programą"

Jei paspausite MILESTONE mygtuką, prie aprašymo bus pridėtas "MILESTONE: " prefiksas, kuris pažymi svarbų tikslą ar etapą.

Aprašymas bus uždėtas į kabutes Taskwarrior komandoje.

SVARBU: Gali būti tik DESCRIPTION, tik ANNOTATE, arba abu kartu.`,

        ANNOTATE: `ANNOTATE laukas skirtas papildomai informacijai, pastaboms ar detalėms apie užduotį.

Kiekviena eilutė bus išsaugota kaip atskira annotate komanda:
- task <ID> annotate "🔹 1. PROJEKTO PRASMĖ / TIKSLAS"
- task <ID> annotate "• Kodėl aš tai darau?"
- task <ID> annotate "• Koks galutinis tikslas / rezultatas?"

Pavyzdžiai:
- "1. e-sveikata."
- "2. Jurgita Kutavičė UAB \"Tavo profilaktika\"."
- "3. Reikia laiko pas gydytoje Lapkričio 24-28 dienomis."

Galite rašyti kelias eilutes - kiekviena nauja eilutė (Enter) sukurs atskirą annotate įrašą.

SVARBU: Gali būti tik DESCRIPTION, tik ANNOTATE, arba abu kartu.`
    }
};

// Eksportavimas globaliam naudojimui
window.DATA = DATA;