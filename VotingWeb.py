# coding:utf-8
import smtplib
from email.mime.text import MIMEText
import pymysql
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('welcome.html')


@app.route('/submit', methods=['POST', 'GET'])
def submit():
    selected_list = []
    try:
        selected_list = request.form.getlist('list')
    except Exception as e:
        print(e)
    code = request.form['code']
    result = valid(code)
    rsp = {
        'success': False,
        'hasVoted': False
    }
    if result is None:
        rsp['success'] = False  # invalid code
    elif result == 0:
        rsp['success'] = True  # 有权投票
        handleVoting(selected_list)
    else:  # result==1
        rsp['success'] = False  # 已经投过票了
        rsp['hasVoted'] = True
    return jsonify(rsp)


@app.route('/voting', methods=['POST'])
def login():
    code = request.form['code']
    result = valid(code)
    if result is not None:
        return render_template('index.html')
    else:
        return render_template('welcome.html', invalid=True)


@app.route('/name_list', methods=['POST'])
def get_name_list():
    db = pymysql.connect('115.159.118.140', 'voting', 'voting', 'voting', charset='utf8mb4')
    sql = "select `ID`,`NAME` from `zhiku` ORDER BY ID"
    data = {
        'list': []
    }
    try:
        with db.cursor() as cursor:
            cursor.execute(sql)
            re = cursor.fetchall()
            data['list'] = re
    except:
        print("error in database")
        db.rollback()
    finally:
        db.close()
    return jsonify(data)


@app.route("/feedback", methods=['POST'])
def feedback():
    send_simple_message(request.form['code'],request.form['email'],request.form['problem'])
    return "谢谢您的反馈<p><a href='/'>点此跳转到首页</a></p>"


def send_simple_message(code,email,content):
    msg = MIMEText("邀请码："+code+"\n邮箱："+email+"\n内容:"+content)
    msg['Subject'] = "voting feedback"
    msg['From'] = "voting@mail2.moeyuiss.tk"
    msg['To'] = "immyk@qq.com"

    s = smtplib.SMTP('email-smtp.us-west-2.amazonaws.com', 587)
    s.starttls()

    s.login('AKIAIUTU6E3FMDDMYEJQ', 'AupIgJtqWOii+a4Ex88rRsBddngEtyehoB+gcSE5MLQw')
    s.sendmail(msg['From'], msg['To'], msg.as_string())
    s.quit()


def valid(code):
    db = connect_db()

    sql = "select `ID`,`has_voted` from `random_code` where `CODE` = '%s'" % code
    try:
        with db.cursor() as cursor:
            # print(sql)
            cursor.execute(sql)
            result = cursor.fetchone()
            if (result == None):
                return None  # Not Founded
            else:
                state = result[1]  # 投票状态
                if state == 0:
                    #   设为已投票
                    cursor.execute('update random_code set has_voted=1 where code="%s"' % code)
                    db.commit()
                return state
    except:
        print("Error: unable to fecth data")
        db.rollback()
    finally:
        db.close()


def handleVoting(list):
    db = connect_db()
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


def connect_db():
    return pymysql.connect('115.159.118.140', 'voting', 'voting', 'voting', charset='utf8mb4')


if __name__ == '__main__':
    app.run()

