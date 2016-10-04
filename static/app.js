

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
                        <a className="navbar-brand" href="/">投票</a>
                    </div>
                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <ul className="nav navbar-nav navbar-right">
                            <li><a href="#">联系我们</a></li>
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
        this.state = {selected_num: 0, cell_list: []}
    }

    dec_selected_num() {
        this.setState({selected_num: this.state.selected_num - 1})
    }

    inc_selected_num() {
        this.setState({selected_num: this.state.selected_num + 1})
    }

    componentDidMount() {
        this.load_name_list()
    }

    load_name_list() {
        $.ajax({
            url: '/name_list',
            cache: false,
            method:'POST',
            success: (data) => {
                this.setState({cell_list: data['list']})
            },
            error: (xhr, status, err) =>
                console.error(url, status, err.toString())
        });
    }

    render() {
        return (
            <div className="container">
                <TableFrame list={this.state.cell_list} inc={this.inc_selected_num.bind(this)}
                            dec={this.dec_selected_num.bind(this)}/>
                <InfoPanel snum={this.state.selected_num} amount={this.state.cell_list.length}/>
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
            alert('没有选择任何智库，确定提交？');
        //todo

        $.ajax({
            url: '/submit',
            data: {'code': this.state.code, 'list': id_list},
            traditional: true,
            type: "POST",
            success: (data) => {
                console.log(data);
                if (data['success'])
                    this.setState({
                        hint: <div className="alert alert-success" role="alert" style={{margin: '10px 0 0 0'}}>
                            提交成功！</div>
                    });
                else
                    this.setState({
                        hint: <div className="alert alert-danger" role="alert" style={{margin: '10px 0 0 0'}}>
                            提交失败！邀请码无效或已经投过票了</div>
                    })
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
                <div className="panel panel-default">
                    <div className="panel-body">
                        <form rule="form" action="">
                            <div className="form-group">
                                <label>校验码</label>
                                <input type="text" value={this.state.code} className="form-control" id="code"
                                       placeholder="请输入邮件中的邀请码" onChange={this.handleTextChange} required/>
                            </div>
                            <button type="submit" className="btn btn-default" onClick={this.handleSubmit}>提交</button>
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
        var $cell = $(e.currentTarget)
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

    render() {
        let tablelist = [];
        this.props.list.map((value)=> {
            tablelist.push(
                <tr onClick={this.handleClick}>
                    <td>{value[0]}</td>
                    <td>{value[1]}</td>
                    <td className="text-center"><input type="checkbox"/></td>
                </tr>
            )
        });
        return (
            <div className="col-md-8">
                <div className=" panel panel-primary">
                    <div className=" panel-heading">
                        <h3 className=" panel-title">注意：</h3>
                    </div>
                    <div className=" panel-body">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus nam nemo alias temporibus,
                        natus
                        veniam labore necessitatibus. Consectetur, in illum culpa fugit magnam atque cupiditate quo
                        reiciendis
                        beatae, neque maxime.
                    </div>
                </div>
                <div id="table-panel">

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
        <Header/>
        <Root/>
    </div>, document.getElementById('app')
);