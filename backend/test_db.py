from database import pool

connection = pool.get_connection()
print("Connected successfully!")
print(connection.is_connected())
connection.close()  # return to the pool
