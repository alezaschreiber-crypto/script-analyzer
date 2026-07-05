from dotenv import load_dotenv
import os
import mysql.connector.pooling

load_dotenv()

# A pool of connections. Each request checks one out and returns it when done,
# so no two threads ever share a connection/cursor (mysql-connector is not
# thread-safe — sharing one caused "Lost connection during query" (2013) under
# concurrent requests).
pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="scriptscope_pool",
    pool_size=10,
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
)


def get_cursor():
    """FastAPI dependency: yield a per-request dict cursor.

    Checks a connection out of the pool, commits on success, and always returns
    the connection to the pool afterwards.
    """
    connection = pool.get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        yield cursor
        connection.commit()
    finally:
        cursor.close()
        connection.close()  # returns the connection to the pool
