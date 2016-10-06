import unittest

import pymysql

from DB import DB


class Tester(unittest.TestCase):
    def setUp(self):
        self.db=pymysql.connect('115.159.118.140', 'voting', 'voting', 'voting', charset='utf8mb4')
        self.d = DB(self.db.cursor())

    def test_get_type_list(self):
        print(self.d.get_type_list())
    def tearDown(self):
        self.db.close()


if __name__ == '__main__':
    unittest.main()
