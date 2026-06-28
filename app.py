from flask import Flask, render_template, jsonify
from database import get_db_connection

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/coffees", methods=["GET"])
def get_coffees():
    conn = get_db_connection()

    coffees = conn.execute("""
        SELECT *
        FROM coffee
        ORDER BY votes DESC
    """).fetchall()

    conn.close()

    coffee_list = []

    for coffee in coffees:
        coffee_list.append({
            "id": coffee["id"],
            "name": coffee["name"],
            "description": coffee["description"],
            "image": coffee["image"],
            "votes": coffee["votes"]
        })

    return jsonify(coffee_list)


@app.route("/api/vote/<int:coffee_id>", methods=["POST"])
def vote(coffee_id):

    conn = get_db_connection()

    coffee = conn.execute(
        "SELECT * FROM coffee WHERE id=?",
        (coffee_id,)
    ).fetchone()

    if coffee is None:
        conn.close()

        return jsonify({
            "success": False,
            "message": "Coffee not found."
        }), 404

    conn.execute(
        """
        UPDATE coffee
        SET votes = votes + 1
        WHERE id=?
        """,
        (coffee_id,)
    )

    conn.commit()

    updated = conn.execute(
        "SELECT votes FROM coffee WHERE id=?",
        (coffee_id,)
    ).fetchone()

    conn.close()

    return jsonify({
        "success": True,
        "message": "Vote added successfully.",
        "votes": updated["votes"]
    })


if __name__ == "__main__":
    app.run(debug=True)