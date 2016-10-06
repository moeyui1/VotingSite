# coding:utf-8
import smtplib
from email.mime.text import MIMEText
import pymysql
from flask import Flask, request, jsonify, render_template
from DB import DB

app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('welcome.html')


@app.route('/submit', methods=['POST', 'GET'])
def submit():
    d=DB()
    selected_list = []
    try:
        selected_list = request.form.getlist('list')
    except Exception as e:
        print(e)
    code = request.form['code']
    result = d.valid(code,True)
    rsp = {
        'success': False,
        'hasVoted': False
    }
    if result is None:
        rsp['success'] = False  # invalid code
    elif result == 0:
        rsp['success'] = True  # 有权投票
        d.handleVoting(selected_list)
    else:  # result==1
        rsp['success'] = False  # 已经投过票了
        rsp['hasVoted'] = True
    return jsonify(rsp)


@app.route('/voting', methods=['POST'])
def login():
    d=DB()
    code = request.form['code']
    result = d.valid(code,False)
    if result is not None:
        return render_template('index.html')
    else:
        return render_template('welcome.html', invalid=True)


# 返回名单表
# 设想的样式：
# {
#     list:[
#         {
#             type:'',
#             items:[]
#         },
#         {
#             type:'',
#             items:[]
#         }
#     ],
#     amount:0
# }
# 这里的sql操作重构会影响性能，故放置~
@app.route('/name_list', methods=['POST'])
def get_name_list():
    db = pymysql.connect('115.159.118.140', 'voting', 'voting', 'voting', charset='utf8mb4')
    d = DB()
    type_list = d.get_type_list()
    sql = "select `ID`,`NAME` from `zhiku` WHERE TYPE=%d ORDER BY ID"
    data = {
        'list': [],
        'amount': 0
    }
    try:
        with db.cursor() as cursor:
            amount = 0
            for i in range(len(type_list)):
                cursor.execute(sql % i)
                temp = cursor.fetchall()
                amount += len(temp)
                item = {
                    'type': type_list[i],
                    'items': temp
                }
                data['list'].append(item)
            data['amount']=amount
    except:
        print("error in database")
        db.rollback()
    finally:
        db.close()
    return jsonify(data)


@app.route("/feedback", methods=['POST'])
def feedback():
    send_simple_message(request.form['code'], request.form['email'], request.form['problem'])
    return "谢谢您的反馈<p><a href='/'>点此跳转到首页</a></p>"


def send_simple_message(code, email, content):
    msg = MIMEText("邀请码：" + code + "\n邮箱：" + email + "\n内容:" + content)
    msg['Subject'] = "voting feedback"
    msg['From'] = "voting@mail2.moeyuiss.tk"
    msg['To'] = "immyk@qq.com"

    s = smtplib.SMTP('email-smtp.us-west-2.amazonaws.com', 587)
    s.starttls()

    s.login('AKIAIUTU6E3FMDDMYEJQ', 'AupIgJtqWOii+a4Ex88rRsBddngEtyehoB+gcSE5MLQw')
    s.sendmail(msg['From'], msg['To'], msg.as_string())
    s.quit()






def connect_db():
    return pymysql.connect('115.159.118.140', 'voting', 'voting', 'voting', charset='utf8mb4')


if __name__ == '__main__':
    app.run()
