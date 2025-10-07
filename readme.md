# TaskWarrior Inbox

🚀 **Greitai kurkite TaskWarrior užduotis su anotacijomis**

Progressive Web App (PWA) skirta TaskWarrior užduočių kūrimui su papildomomis anotacijomis. Veikia offline ir gali būti įdiegta kaip programėlė.

## ✨ Funkcijos

- ✅ **DESCRIPTION laukas** - užduoties aprašymas su MILESTONE palaikymu
- ✅ **ANNOTATE laukas** - multi-line anotacijos (kiekviena eilutė = atskira `task <ID> annotate`)
- ✅ **Real-time preview** - matykite TaskWarrior komandas iš karto
- ✅ **Export į .txt** - eksportuokite visas užduotis vienu failu
- ✅ **LocalStorage** - išsaugokite užduotis lokaliame naršyklėje
- ✅ **PWA palaikymas** - įdiekite kaip programėlę, veikia offline
- ✅ **Responsive design** - veikia mobiliuose ir kompiuteriuose

## 🎯 Kaip naudoti

### Description Laukas

Įveskite užduoties aprašymą. Galite:

- Rašyti kelias eilutes (spauskite Enter)
- Pažymėti kaip MILESTONE

Rezultatas:

```bash
task add "Jūsų užduoties aprašymas"
```

### Annotate Laukas

Įveskite papildomas pastabas ar detales. Kiekviena nauja eilutė sukurs atskirą anotaciją:

```
1. Jūsų pastaba.
2. Jūsų pastaba.
3. Jūsų pastaba.
```

Rezultatas:

```bash
task <ID> annotate "1. Jūsų pastaba."
task <ID> annotate "2. Jūsų pastaba."
task <ID> annotate "3. Jūsų pastaba."
```

### Abu kartu

Jei užpildyti abu laukai:

```bash
task add "Jūsų užduoties aprašymas"
+
task <ID> annotate "1. Jūsų pastaba."
task <ID> annotate "2. Jūsų pastaba."
task <ID> annotate "3. Jūsų pastaba."
```

## 📦 Diegimas

### Kaip PWA

1. Atidarykite https://jusu-domain.com/tw-inbox/
2. Spauskite "Įdiegti programėlę" mygtuką
3. Programėlė bus įdiegta jūsų įrenginyje

### Lokaliai

```bash
# Klonuoti repozitoriją
git clone https://github.com/jusu-vartotojas/taskwarrior-inbox.git

# Projekto struktūra:
# tw-inbox/ - visa programėlė šiame folderyje
# Reikia local server'io (pvz. Live Server VS Code)
```

## 🛠️ Technologijos

- **Vanilla JavaScript** - be jokių framework'ų
- **CSS Custom Properties** - moderni stilių sistema
- **LocalStorage API** - duomenų saugojimas
- **Service Workers** - offline funkcionalumas
- **PWA** - Progressive Web App

## 📁 Projekto struktūra

```
tw-inbox/
├── index.html                    # Pagrindinis HTML
├── manifest.json                 # PWA manifest
├── sw.js                        # Service Worker
├── projekt/
│   ├── app.js                   # Pagrindinis app orchestrator
│   ├── config.js                # Konfigūracija
│   ├── data.js                  # Duomenys ir help tekstai
│   ├── export-manager.js        # .txt eksportavimas
│   ├── localStorage-manager.js  # LocalStorage valdymas
│   ├── help-modal.js           # Help modal sistema
│   ├── cards/
│   │   ├── description-card.js  # DESCRIPTION kortelė
│   │   ├── annotate-card.js     # ANNOTATE kortelė
│   │   ├── actions-card.js      # Preview ir mygtukai
│   │   └── statistics-card.js   # Išsaugotų užduočių sąrašas
│   └── css/
│       ├── main.css             # Pagrindinis CSS
│       ├── variables.css        # CSS kintamieji
│       ├── utilities.css        # Utility klasės
│       ├── description-card.css # Description stiliai
│       ├── annotate-card.css    # Annotate stiliai
│       ├── actions-card.css     # Actions stiliai
│       └── statistics-card.css  # Statistics stiliai
└── icons/
    ├── icon-192x192.png
    └── icon-512x512.png
```

## 🎨 Validacija

- **Bent vienas laukas privalomas** - DESCRIPTION arba ANNOTATE
- Abu laukai neprivalomi atskirai
- Galima išsaugoti tik DESCRIPTION, tik ANNOTATE, arba abu

## 💾 Export

Spauskite **EXPORT** mygtuką - sukuriamas `taskwarrior_YYYY-MM-DD.txt` failas su visomis išsaugotomis užduotimis.

## 📱 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers

## 📄 Licencija

MIT License - naudokite laisvai!

## 👤 Autorius

Sukurta su ❤️ 

---

**🔗 TaskWarrior:** https://taskwarrior.org/
