import pymysql


class DB:
    def __init__(self):
        pass

    def get_type_list(self):
        sql = "select `NAME` from `SHEET` where 1 ORDER BY ID"
        result = []
        db = self.__connect_db()
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

    def handleVoting(self, list):
        db = self.__connect_db()
        presql = 'select `NUM` from zhiku where `id`=%d'
        sql = 'update zhiku set num=%d where id =%d'
        try:
            with db.cursor() as c:
                for i in iter(list):
                    i = int(i)  # ajax提交过来的是字符串
                    c.execute(presql % i)
                    num = c.fetchone()[0]
                    num += 1
                    c.execute(sql % (num, i))
            db.commit()
        except Exception as e:
            print("Error: unable to fecth data", e)
            db.rollback()
        finally:
            db.close()

    def valid(self, code):
        db = self.__connect_db()

        sql = "select `ID`,`has_voted` from `random_code` where `CODE` = '%s'" % code
        try:
            with db.cursor() as cursor:
                cursor.execute(sql)
                result = cursor.fetchone()
                if result is None:
                    return None  # Not Founded
                else:
                    state = result[1]  # 投票状态
                    if state == 0:
                        #   设为已投票
                        cursor.execute('update random_code set has_voted=1 where code="%s"' % code)
                        db.commit()
                    return state
        except:
            print("Error: unable to fecth data when valid")
            db.rollback()
        finally:
            db.close()

    # def get_zhiku_by_type(self, type, type_list):
    #     db = self.__connect_db()
    #     sql = "select `ID`,`NAME` from `zhiku` WHERE TYPE=%d ORDER BY ID"
    #     try:
    #         with db.cursor() as cursor:
    #             cursor.execute(sql % i)
    #             return cursor.fetchall()
    #
    #     except:
    #         print("error in database when get_zhiku_by_type")
    #         db.rollback()
    #     finally:
    #         db.close()

    def __connect_db(self):
        return pymysql.connect('115.159.118.140', 'voting', 'voting', 'voting', charset='utf8mb4')

if __name__ == '__main__':
    d = DB()
    print(d.get_type_list())
