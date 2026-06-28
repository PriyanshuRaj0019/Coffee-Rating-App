from database import get_db_connection

conn = get_db_connection()
cursor = conn.cursor()

# Drop existing table (for development only)
cursor.execute("DROP TABLE IF EXISTS coffee")

# Create table
cursor.execute("""
CREATE TABLE coffee (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    votes INTEGER DEFAULT 0
)
""")

# Sample coffee data
coffees = [
    (
        "Espresso",
        "Strong and concentrated black coffee.",
        "https://upload.wikimedia.org/wikipedia/commons/4/45/A_small_cup_of_coffee.JPG",
        15
    ),
    (
        "Latte",
        "Smooth espresso with steamed milk.",
        "https://upload.wikimedia.org/wikipedia/commons/d/d8/Caffe_Latte_at_Pulse_Cafe.jpg",
        25
    ),
    (
        "Cappuccino",
        "Espresso with steamed milk and foam.",
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Cappuccino_at_Sightglass_Coffee.jpg",
        18
    ),
    (
        "Mocha",
        "Chocolate flavored coffee.",
        "https://upload.wikimedia.org/wikipedia/commons/f/f6/Mocaccino-Coffee.jpg",
        12
    ),
    (
        "Americano",
        "Espresso diluted with hot water.",
        "https://upload.wikimedia.org/wikipedia/commons/0/09/Caff%C3%A8_Americano.JPG",
        20
    ),
    (
        "Cold Brew",
        "Slow brewed coffee served cold.",
        "https://upload.wikimedia.org/wikipedia/commons/7/72/Cold_Brew_Coffee_2.jpg",
        10
    )
]


cursor.executemany("""
INSERT INTO coffee(name, description, image, votes)
VALUES (?, ?, ?, ?)
""", coffees)

conn.commit()
conn.close()

print("Database created successfully!")