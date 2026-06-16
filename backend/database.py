import mysql.connector

connection = mysql.connector.connect(
    host="localhost",
    user="YOUR_USERNAME",
    password="YOUR_PASSWORD",
    database="script_analyzer"
)

cursor = connection.cursor(dictionary=True)