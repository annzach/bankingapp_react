var Button = ReactBootstrap.Button;
var Modal = ReactBootstrap.Modal;
const App = React.createClass({
  getInitialState(){
    return {
      transactions:[]
    }
  },
  
  updateTransaction(id,newTransaction){
    console.log("updateTransaction id", id);
    const {transactions} = this.state;
    let index = transactions.findIndex(element =>{
      return element.time == id;
    });
    console.log("index", index);
    transactions[index] = newTransaction;
    console.log("this.state.transactions",this.state.transactions)
    this.setState({
      transactions: transactions
    })

  },
  addNewTransaction(newTransaction){
    const {transactions} = this.state;
    this.setState({
      transactions:[...transactions,newTransaction]
    })
  }, 

   removeTransactions(id){
    const {transactions} = this.state;
    this.setState({
      transactions:transactions.filter(element=> id !== element.id)
    });
   },

   getTotal(){
    const {transactions} = this.state;
    let totalObj={};
    let total=0, creditTotal=0, debitTotal=0;
    for(let i=0; i< transactions.length; ++i) {
       if(transactions[i].transtype === "credit"){
        console.log("total credit");
        total+= transactions[i].amount;
        creditTotal+= transactions[i].amount;
        totalObj.total = total;
        totalObj.creditTotal = creditTotal;
       }
       else{
        console.log("total debit")
        total-= transactions[i].amount;
        debitTotal+= transactions[i].amount;
        totalObj.total=total;
        totalObj.debitTotal=debitTotal;
       }
    }
    return totalObj;
   },


  render(){
    const {transactions} = this.state;
    const balanceSheet = this.getTotal();
    return (
      <div className="container">
        <h1>Banking App</h1>
        <div className="row">
          <h3>
            <div className="alert alert-info" role="alert">
               Balance : ${balanceSheet.total} ||
               Total Debit : ${balanceSheet.debitTotal} ||
               Total Credit : ${balanceSheet.creditTotal}
            </div>
          </h3>
        </div>
        <BankingForm addTransaction={this.addNewTransaction}/>
        <BankingTable tableTransaction={transactions} removeTrans = {this.removeTransactions}
                      updateTrans={this.updateTransaction}/>
      </div>
    )
  }
})

// Banking Form Component
const BankingForm = React.createClass({
  submitForm(event){
    event.preventDefault();
    let {description, amount,transtype} = this.refs;

     let trans = {
      description:description.value,
      amount:parseFloat(amount.value),
      transtype:transtype.value,
      time:Date.now(),
      id:uuid()
     }
     this.props.addTransaction(trans);
  },
  render(){
    return (
          <form onSubmit= {this.submitForm}>
            <div class="form-group">
              <input type="text"  id="descId" placeholder="Description" required ref="description"/>
              &nbsp;&nbsp;
              <input type="number"  id="amountId" placeholder="Amount" min='0' step='0.01' required ref="amount"/>
              &nbsp;&nbsp;
              <select ref="transtype">
                  <option value="credit" >Credit</option>
                  <option value="debit" >Debit</option>
              </select>
              <button className="glyphicon glyphicon-plus btn btn-sm btn-success"></button>
            </div>
        </form>
    )
  }
})

//Banking Table Component
const BankingTable = React.createClass({
  getInitialState(){
    return {
      showModal:false,
      editType:'',
      editAmount:parseFloat(0),
      editDesc:'',
      editCreatedAt:''
    }
  },
  cancelEdit() {
    this.setState({editId: null});
    this.closeModal();
  },

  closeModal() {
    this.setState({showModal: false});
  },

  openModal() {
    this.setState({showModal: true});
  },

  editTransaction(tableTransaction) {
    this.openModal();
    this.setState({
      editDesc: tableTransaction.description,
      editAmount: tableTransaction.amount,
      editType: tableTransaction.transtype,
      editCreatedAt:tableTransaction.time
    })

  },

  saveEdit(id) {
    debugger;
   let newTransaction = {
      transtype: this.state.editType,
      description: this.state.editDesc,
      amount: this.state.editAmount,
      time: Date.now(),
      id:this.state.editCreatedAt
    };
    console.log("newTransaction in save edit",newTransaction)
    this.props.updateTrans(id, newTransaction);
    //this.setState({editedDate: null});
    this.closeModal();
  },


  render() {
    
    const {tableTransaction,removeTrans,updateTrans} = this.props;
   
    return (
      
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Delete/Update</th>
            </tr>
          </thead>
          <tbody>
           {tableTransaction.map(tableTransaction=>{
             console.log("tableTransaction amount",tableTransaction.amount);
             var debit =0;
             var credit =0;
             if(tableTransaction.transtype == "credit"){
              credit = tableTransaction.amount;
             }

            else{
              debit = tableTransaction.amount;
            }

            return (
             <tr key= {tableTransaction.id}>
               <td>{moment(tableTransaction.time).format('lll')}</td>
               <td>{tableTransaction.description}</td>
               <td>-{debit}</td>
               <td>+{credit}</td>
               <td><button onClick= {removeTrans.bind(null,tableTransaction.id)}className="btn btn-sm btn-danger glyphicon glyphicon-trash"></button>
                   <button onClick={() => this.editTransaction(tableTransaction)}className="btn btn-sm btn-primary glyphicon glyphicon-edit"></button></td>
           </tr>
              )
           })}
      
          </tbody>
          <Modal show={this.state.showModal} onHide={this.closeModal}>
          <Modal.Header closeButton>
          <Modal.Title>Edit</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input type="radio" name= "type" value="debit" onClick={e=>{this.setState({editType: e.target.value})}}/> Debit &nbsp;
            <input type="radio" name= "type" value="credit" onClick={e=>{this.setState({editType: e.target.value})}}/> Credit
            <br/>
            <span>AMOUNT: </span>
            <input
              type="number"
              min="0"
              className="form-control"
              id="exampleInputAmount"
              placeholder="Amount"
              value={this.state.editAmount}
              onChange={e => {this.setState({editAmount: parseFloat(e.target.value)}) }}
            />
            <br/>
            <span>DESCRIPTION: </span>
            <input
              type="text"
              className="form-control"
              placeholder="Description"
              value={this.state.editDesc}
              onChange={e => {this.setState({editDesc: e.target.value}) }}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn btn-primary" onClick={() => this.saveEdit(this.state.editCreatedAt)}>Save</Button>
            <Button onClick={this.cancelEdit}>Close</Button>
          </Modal.Footer>
        </Modal>
        </table>
    
      )
    }
  })


ReactDOM.render(<App/>, document.getElementById('root'));