import pymysql


class DB:
    def __init__(self):
        pass

    def get_type_list(self):
        sql = "select `NAME` from `SHEET` where 1 ORDER BY ID"
        result = []
        db = self.connect_db()
        try:
            with db.cursor() as c:
                c.execute(sql)
                a = c.fetchall()
                for i in a:
                    result.append(i[0])
        except Exception as e:
            print("error when getTypeList")
            db.rollback()
        finally:
            db.close()
        return result

    def connect_db(self):
        return pymysql.connect('115.159.118.140', 'voting', 'voting', 'voting', charset='utf8mb4')


if __name__ == '__main__':
    d = DB()
    print(d.get_type_list())
