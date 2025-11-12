// projekt/data.js

const DATA = {
    HELP: {
        DESCRIPTION: `DESCRIPTION laukas nurodo su kuria sritimi užduotys susijusios.

Pavyzdžiai:
- "Revit programos mokymasis"
- "E-sveikata"
- "Projektas X"

Galite rašyti kelias eilutes (spauskite Enter).

SVARBU: Gali būti tik DESCRIPTION, tik ANNOTATE, arba abu kartu.`,

        ANNOTATE: `ANNOTATE laukas skirtas užduočių sąrašui.

Kiekviena nauja eilutė = atskira užduotis:

Pavyzdžiai:
- "1. Atsisiųsti programą"
- "2. Peržiūrėti video pamokas"
- "3. Sukurti test projektą"

Galite rašyti kelias eilutes - kiekviena nauja eilutė (Enter) sukurs atskirą užduotį.

SVARBU: Gali būti tik DESCRIPTION, tik ANNOTATE, arba abu kartu.`
    }
};

window.DATA = DATA;