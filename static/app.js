class Header extends React.Component {
    render() {
        return (
            <nav className="navbar navbar-default navbar-fixed-top" role="navigation">

                <div className="container-fluid">
                    {/*<!-- Brand and toggle get grouped for better mobile display -->*/}
                    <div className="navbar-header">
                        <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                                data-target="#bs-example-navbar-collapse-1">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                        </button>
                        <a className="navbar-brand" href="/"><strong id="title">首批CTTI来源智库评审投票系统</strong></a>
                    </div>
                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <ul className="nav navbar-nav">
                            <li><a href="#sheet0">国家党政军、科研院所智库</a></li>
                            <li><a href="#sheet1">地方智库</a></li>
                            <li><a href="#sheet2">高校智库</a></li>
                            <li><a href="#sheet3">社会、媒体智库</a></li>

                        </ul>
                        <ul className="nav navbar-nav navbar-right">
                            <li><a data-toggle="modal" href="#feedback">遇到问题？</a></li>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}
class Root extends React.Component {
    constructor() {
        super();
        this.state = {
            selected_num: 0, cell_list: {
                'list': [],
                'amount': 0
            }
        }
    }

    dec_selected_num() {
        this.setState({selected_num: this.state.selected_num - 1})
    }

    inc_selected_num() {
        this.setState({selected_num: this.state.selected_num + 1})
    }

    componentDidMount() {
        this.load_name_list();
        // $('#table-panel').scrollspy({target: '.navbar-example'})
    }

    load_name_list() {
        $.ajax({
            url: '/name_list',
            cache: false,
            method: 'POST',
            success: (data) => {
                this.setState({cell_list: data})
            },
            error: (xhr, status, err) =>
                console.error(url, status, err.toString())
        });
    }

    render() {
        return (
            <div className="container">
                <TableFrame list={this.state.cell_list['list']} inc={this.inc_selected_num.bind(this)}
                            dec={this.dec_selected_num.bind(this)}/>
                <InfoPanel snum={this.state.selected_num} amount={this.state.cell_list['amount']}/>
            </div>
        )
    }
}


class InfoPanel extends React.Component {

    constructor() {
        super();
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.state = {code: '', hint: null}
    }

    handleSubmit(e) {
        e.preventDefault();
        var id_list = [];
        $('tr.info>td:first-child').each(function () {
            id_list.push($(this).html())
        });
        // console.log(id_list)
        if (id_list.length == 0)
            $('#confirm').modal('toggle');
        else
            this.submitdata(id_list);


    }

    componentDidUpdate() {
        $(".alert").fadeIn('slow');
        setTimeout("$('.alert').fadeOut('slow')", 5000)
    }

    submitdata(id_list) {
        $.ajax({
            url: '/submit',
            data: {'code': this.state.code, 'list': id_list},
            traditional: true,
            type: "POST",
            success: (data) => {
                if (data['success'])
                    this.setState({
                        hint: <div className="alert alert-success" role="alert" style={{margin: '10px 0 0 0'}}>
                            提交成功！</div>
                    });
                else
                    this.setState({
                        hint: <div className="alert alert-danger" role="alert"
                                   style={{margin: '10px 0 0 0', display: 'none'}}>
                            提交失败！邀请码无效或已经投过票了</div>
                    });
            },
            error: (xhr, status, err) =>
                console.error(url, status, err.toString())

        })
    }

    handleTextChange(e) {
        this.setState({code: e.target.value})
    }

    render() {
        return (
            <div className="col-md-4">
                {/*模态框*/}

                <div id="confirm" className="modal fade bs-example-modal-sm" tabindex="-1" role="dialog"
                     aria-labelledby="mySmallModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-sm">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal"><span
                                    aria-hidden="true">&times;</span><span className="sr-only">Close</span></button>
                                <h4 className="modal-title">提示</h4>
                            </div>
                            <div className="modal-body">
                                <p>没有选中任何智库，确定提交？</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">取消</button>
                                <button type="button" className="btn btn-primary" data-dismiss="modal"
                                        onClick={()=>this.submitdata([])}>确定
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/*end模态框*/}

                <div className="panel panel-default">
                    <div className="panel-body">
                        <form rule="form" action="">
                            <div className="form-group">
                                <label>校验码</label>
                                <input type="text" value={this.state.code} className="form-control" id="code"
                                       placeholder="请输入邮件中的邀请码" onChange={this.handleTextChange} required/>
                            </div>
                            <button type="submit" className="btn btn-default" onClick={this.handleSubmit}>提交
                            </button>
                            {this.state.hint}
                        </form>
                    </div>
                </div>

                <div className="well well-sm ">
                    <text>已选/总数</text>
                    <h1 className="text-center">
                        <sapn id="selected_num">{this.props.snum}</sapn>
                        <span>/</span>
                        <span id="amount">{this.props.amount}</span>
                    </h1>
                </div>

            </div>
        );
    }
}

class TableFrame extends React.Component {
    constructor() {
        super();
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(e) {
        var $cell = $(e.currentTarget);
        if ($cell.hasClass('info')) {
            $cell.removeClass('info');
            $cell.children('td').children('input').prop('checked', false);
            this.props.dec();
        } else {
            $cell.addClass('info');
            $cell.children('td').children('input').prop('checked', true);
            this.props.inc();
        }
    }

    componentDidUpdate() {
        // $('[data-spy="scroll"]').each(function () {
        //     var $spy = $(this).scrollspy('refresh')
        // })
    }

    render() {
        var tablelist = [];
        this.props.list.map((value, i)=> {
            tablelist.push(
                <tr>
                    <th colSpan="3" className="text-center" id={"sheet" + i}>{value['type']}</th>
                </tr>
            );
            value['items'].map((itemvalue)=> {
                tablelist.push(
                    <tr onClick={this.handleClick}>
                        <td>{itemvalue[0]}</td>
                        <td>{itemvalue[1]}</td>
                        <td className="text-center"><input type="checkbox"/></td>
                    </tr>
                )
            })
        });
        return (
            <div className="col-md-8">
                <div className=" panel panel-primary">
                    <div className=" panel-heading">
                        <h3 className=" panel-title">注意：</h3>
                    </div>
                    <div className=" panel-body">
                        <p style={{'text-indent': '2em'}}>
                            以下为本次遴选的所有智库名单，请您在仔细阅读后，在非智库机构后勾选。
                        </p></div>
                </div>
                <div id="table-panel" data-spy="scroll" data-target=".navbar-collapse">

                    <div className="panel panel-default">
                        <div className="panel-heading">智库列表</div>
                        <table className=" tableizer-table table table-striped table-hover table-responsive">
                            <thead>
                            <tr className=" tableizer-firstrow">
                                <th>序号</th>
                                <th className="text-center">名称</th>
                                <th>选中</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tablelist}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <div>
        {/*反馈模态框*/}
        <div id="feedback" className="modal fade bs-example-modal-sm" tabindex="-1" role="dialog"
             aria-labelledby="mySmallModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal"><span
                            aria-hidden="true">&times;</span><span className="sr-only">Close</span></button>
                        <h4 className="modal-title">反馈</h4>
                    </div>
                    <div className="modal-body">
                        <form role="form" action="/feedback" id="feedback_form" method="POST">
                            <input className="form-control" type="text" placeholder="您的邀请码（可选）" name="code"
                                   style={{margin: '0 0  10px 0'}}/>
                            <input className="form-control" type="email" placeholder="您的邮箱（可选）" name="email"
                                   style={{margin: '0 0  10px 0'}}/>
                            <textarea className="form-control" rows="3" required="required" placeholder="您遇到的问题..."
                                      name="problem" style={{margin: '0 0 10px 0'}}/>
                            <div className="row">
                                <button type="button" className="btn btn-default col-md-offset-10 col-xs-offset-9"
                                        data-dismiss="modal">取消
                                </button>
                                <button type="submit" className="btn btn-primary " style={{'margin-left': '10px'}}>提交
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        {/*end模态框*/}
        <Header/>
        <Root/>
    </div>, document.getElementById('app')
);