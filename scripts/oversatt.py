# Bygger den engelska sidan en.html (amerikansk engelska) från index.html. Kör efter varje ändring i index.html:
#   python scripts/oversatt.py
# Skriptet stoppar om en svensk text inte finns kvar att översätta eller om svensk text blir kvar.
import re
from pathlib import Path

ROT = Path(__file__).resolve().parent.parent
URL = "https://joachimjohansson.github.io/stage/"

# (svenska, engelska), längre texter före kortare som ingår i dem
OVERSATTNING = [
    ('<html lang="sv">', '<html lang="en">'),
    ("<title>Stage Door – Bar & restaurang på Berzeliigatan 12, Göteborg</title>",
     "<title>Stage Door – Bar & restaurant on Berzeliigatan 12, Gothenburg</title>"),
    ('content="Bar och restaurang på Berzeliigatan 12 i Göteborg. Vällagad mat från en prisvärd meny, utvalda viner och en stilla öl i baren. Öppet alla dagar, tidigare vid större evenemang."',
     'content="Bar and restaurant on Berzeliigatan 12 in Gothenburg. Good food from an affordable menu, selected wines, and a quiet beer at the bar. Open every day, earlier during major events."'),
    (f'<link rel="canonical" href="{URL}">', f'<link rel="canonical" href="{URL}en.html">'),
    ('<meta property="og:locale" content="sv_SE">', '<meta property="og:locale" content="en_US">'),
    ('content="Stage Door – Bar & restaurang på Berzeliigatan 12, Göteborg"', 'content="Stage Door – Bar & restaurant on Berzeliigatan 12, Gothenburg"'),
    ('content="Vällagad mat, utvalda viner och en gemytlig atmosfär. Öppet alla dagar."', 'content="Good food, selected wines, and a warm, friendly atmosphere. Open every day."'),
    (f'<meta property="og:url" content="{URL}">', f'<meta property="og:url" content="{URL}en.html">'),
    ('aria-label="Huvudmeny"', 'aria-label="Main menu"'),
    ('<a href="#meny">Meny</a><a href="#scenen">Om</a><a href="#kassan">Kontakt</a>', '<a href="#meny">Menu</a><a href="#scenen">About</a><a href="#kassan">Contact</a>'),
    ('<a class="sprak" href="en.html" lang="en" hreflang="en">English</a>', '<a class="sprak" href="./" lang="sv" hreflang="sv">Svenska</a>'),
    ("Öppet i kväll", "Open tonight"),
    ("Bar & Restaurang", "Bar & Restaurant"),
    ('aria-label="Öl som hälls upp i ett glas"', 'aria-label="Beer being poured into a glass"'),
    ("<small>Söndag - torsdag</small>", "<small>Sunday–Thursday</small>"),
    ("<small>Fredag</small>", "<small>Friday</small>"),
    ("<small>Lördag</small>", "<small>Saturday</small>"),
    # Öppettiderna i 12-timmarsformat
    ("<b>16-01</b>", "<b>4 PM – 1 AM</b>"),
    ("<b>15-02</b>", "<b>3 PM – 2 AM</b>"),
    ("<b>14-02</b>", "<b>2 PM – 2 AM</b>"),
    ("Vi öppnar dessutom tidigare vid större evenemang.", "We also open earlier during major events."),
    ('aria-label="Stage Door på Instagram"', 'aria-label="Stage Door on Instagram"'),
    ('aria-label="Stage Door på Facebook"', 'aria-label="Stage Door on Facebook"'),
    ("<h2>Meny</h2>", "<h2>Menu</h2>"),
    ("<h3>Starters &amp; Sharers</h3>", "<h3>Appetizers</h3>"),
    ("Innehåller (G) gluten · (L) laktos · (N) nötter", "Contains (G) gluten · (L) lactose · (N) nuts"),
    ("<b>Gratinerade nachos med chiligryta<em>", "<b>Baked nachos with chili<em>"),
    ("<b>Gratinerade nachos<em>", "<b>Baked nachos<em>"),
    ("Med chiligryta på köttfärs, gräddfil, tomatsalsa och pico de gallo", "With beef chili, sour cream, tomato salsa, and pico de gallo"),
    ("Serveras med gräddfil, tomatsalsa och pico de gallo", "Served with sour cream, tomato salsa, and pico de gallo"),
    ("<b>Barsnacks<em>", "<b>Bar snacks<em>"),
    ("Ölkorv, oliver och goudaost med nachos och aïoli. Gjort för att delas", "Beer sausage, olives, and Gouda with nachos and aioli. Made for sharing"),
    ("Lökringar, mozzarella sticks och pommes frites med aïoli. Lite av varje att dela på", "Onion rings, mozzarella sticks, and french fries with aioli. A little bit of everything to share"),
    ("Kycklingvingar i Frank’s Hot Sauce med aïoli som svalkar. Välj 6, 12 eller 18 vingar", "Chicken wings in Frank’s Hot Sauce with cooling aioli. Choose 6, 12, or 18 wings"),
    ("Smashad burgare av högrev och bringa med cheddarost och bacon glacerat i lönnsirap. Med pommes och aïoli",
     "Smashed chuck and brisket burger with cheddar and maple-glazed bacon. Served with french fries and aioli"),
    ("Smashad burgare av högrev och bringa med cheddarost, pico de gallo och Frank’s Hot Sauce. Med pommes och aïoli",
     "Smashed chuck and brisket burger with cheddar, pico de gallo, and Frank’s Hot Sauce. Served with french fries and aioli"),
    ("<strong>Går att få vegansk</strong>", "<strong>Vegan option available</strong>"),
    ("Baby back ribs med coleslaw, majs och pommes frites", "Baby back ribs with coleslaw, corn, and french fries"),
    ("<b>Caesarsallad<em>", "<b>Caesar salad<em>"),
    ("Klassisk caesar med romansallad, kyckling, bacon, tomat och krutonger, toppad med Grana Padano och caesardressing",
     "Classic Caesar with romaine, chicken, bacon, tomato, and croutons, topped with Grana Padano and Caesar dressing"),
    ("<b>Pasta med kyckling<em>", "<b>Chicken pasta<em>"),
    ("Penne i krämig vitvinssås med kyckling, lök och en hetta av chili", "Penne in a creamy white wine sauce with chicken, onion, and a kick of chili"),
    ("Friterad fisk och pommes frites med remouladsås", "Fried fish and french fries with remoulade"),
    ("Friterad camembert med hjortronsylt och persilja", "Deep-fried Camembert with cloudberry jam and parsley"),
    ("<b>Friterad camembert<em>", "<b>Deep-fried Camembert<em>"),
    ("<b>Chokladglassbakelse<em>", "<b>Chocolate ice cream cake<em>"),
    ("Chokladglass med hasselnöt och sabayonne", "Chocolate ice cream with hazelnut and sabayon"),
    ("Precis som namnet antyder är Stage Door ett populärt inneställe för stadens alla musik-, teater- och varietéartister. Här kan Du alltid äta en bit mat från vår prisvärda meny, njuta ett glas gott vin eller varför inte bara en stilla öl i vår trivsamma bar. Vällagad mat, utvalda viner och en gemytlig atmosfär gör att vi tror att Du kommer få en trevlig kväll!",
     "Just as the name suggests, Stage Door is a popular haunt for the city’s musicians, actors, and variety performers. Here you can always have a bite from our affordable menu, enjoy a glass of good wine, or just grab a quiet beer at our cozy bar. Good food, selected wines, and a warm, friendly atmosphere mean we think you’ll have a great night!"),
    ('alt="Matsalen på Stage Door med väggar fulla av inramade artistporträtt"', 'alt="The dining room at Stage Door, with walls full of framed artist portraits"'),
    ('alt="Fasaden med uteservering på Berzeliigatan"', 'alt="The front with outdoor seating on Berzeliigatan"'),
    ('alt="Kristallkrona framför porträttväggen"', 'alt="Crystal chandelier in front of the portrait wall"'),
    ('alt="Bardisken med barstolar"', 'alt="The bar counter with bar stools"'),
    ('alt="Ölkranar i mässing"', 'alt="Brass beer taps"'),
    ("Platshållare – öllista från Stage Door", "Placeholder – beer list from Stage Door"),
    (">Från kranen<", ">On tap<"),
    ('aria-label="Öllista saknas ännu"', 'aria-label="Beer list not yet available"'),
    ("<li>Kran ", "<li>Tap "),
    (">Boka bord<", ">Reserve a table<"),
    ("Ring eller mejla oss, så återkommer vi så snart vi kan.", "Call or email us and we’ll get back to you as soon as we can."),
    ("<small>Film: ", "<small>Video: "),
]

# Svenska tecken som får finnas kvar: ortnamn och adresser
TILLATET = ["Göteborg", "G%C3%B6teborg"]


def oversatt(sv: str) -> str:
    en = sv
    for fran, till in OVERSATTNING:
        if fran not in en:
            raise SystemExit(f"Hittar inte texten att översätta: {fran[:70]}")
        en = en.replace(fran, till)
    return en


def kvarvarande_svenska(html: str) -> list[str]:
    # Bara synlig text och attribut, inte kommentarer, skript, stil eller logons former
    t = re.sub(r"<!--.*?-->|<script.*?</script>|<style.*?</style>|\sd=\"[^\"]*\"", " ", html, flags=re.S)
    for ok in TILLATET:
        t = t.replace(ok, "")
    return sorted(set(re.findall(r"[^<>\"]{0,30}[åäöÅÄÖ][^<>\"]{0,30}", t)))


if __name__ == "__main__":
    sv = (ROT / "index.html").read_text(encoding="utf-8")
    en = oversatt(sv)
    rest = kvarvarande_svenska(en)
    if rest:
        raise SystemExit("Svensk text finns kvar:\n" + "\n".join(rest))
    (ROT / "en.html").write_text(en, encoding="utf-8", newline="")
    print(f"en.html byggd ({len(OVERSATTNING)} översättningar)")
