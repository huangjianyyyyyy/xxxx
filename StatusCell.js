import React from 'react';
import { Menu, Dropdown, Button,message , Modal} from 'antd';
import { withTranslation } from 'react-i18next';
import { Cell } from '../../../maintable/FixedDataTableRoot';
import './StatusCell.less';
import { getTodoBoardFlag } from '../taskcolumns/TaskColumns';
import { ColumnType, ModalTypes , StatusReturn} from '../../../maintable/data/MainTableType';
import StatusGridCell from './StatusCell/StatusGridCell';

@withTranslation()
class StatusCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rowIndex: props.rowIndex,
      isEdit: true,
      value: props.value,
      Statusvisible:false,
      usingButton:false,
      buttonflowModel:null,
      personSet:true,
      redoVisible:false
    };
  }

  getStatusMenu = () => {
    const {  data, columnKey , isColumnReadonly ,isReadonly } = this.props;
    // if (isReadonly) {
    //   return;
    // }
    const StatusListData = data._dataset._columnData[data._boardId] && data._dataset._columnData[data._boardId][columnKey].filter(col=>(col.category !==StatusReturn.category));

    const menu = (
      <Menu className='statusCellMenu' style={{ pointerEvents: 'visible' }}>
        {
          <StatusGridCell
            onhandleMenuClick={this.handleMenuClick}
            StatusListData={StatusListData}
            isColumnReadonly={isColumnReadonly}
            {...this.props}
            isEdit={this.state.isEdit}
          />
        }
      </Menu>
    );
    return menu;
  };

  getStatusObjByID = (ID) => {
    const { data, columnKey,value,color } = this.props;

    let board = data._dataset._workspace[data._boardId]
    if (board && getTodoBoardFlag(board.boardType)) {
      let item ={}
      item["value"]=value
      item["color"]=color
      return item
    }else{
      const StatusListData =
      data._dataset._columnData && data._dataset._columnData[data._boardId] && data._dataset._columnData[data._boardId][columnKey];
      const item = StatusListData && StatusListData.find((ele) => {
        return ele.id == ID;
      });
      return item ? item : '';
    }
    
  };

  handleMenuClick = (id, e) => {
    if(!this.isRequired()){
      return;
    }
    this.setState({Statusvisible:false})
    this.props.handleCellEdit(ColumnType.STATUS);
    const selectedKey = id;
    const selectedStyle = ".workingItem";
    this.setState({
      value: selectedKey,
      originalValue: selectedKey,
      styleClassName: selectedStyle,
    });
    this.props.handleChange(selectedKey, true);
    if (this.props.rowIndex) {
      //状态的反向联动
      // const relationCellToCell = new RelationCellToCell(this.props);
      // relationCellToCell.adminChangeStatus(selectedKey);
      e.stopPropagation();
    }
  };
  componentDidUpdate(prevProps, prevState) {
    let { value, rowIndex ,data,color} = this.props;
    let board = data._dataset._workspace[data._boardId]
    if ((value != prevState.originalValue || rowIndex != prevState.rowIndex)&&!this.props.isColumnReadonly) {
      this.setState({
        value: value, //|| TaskStatus.NOT_STARTED_STATUS
        originalValue: value,
        rowIndex: rowIndex,
      });
    }
  }
  mouseEnter=(e)=>{
    let {  columnKey ,data,rowIndex,modaltype,isReadonly} = this.props;
    let { value} = this.state;
    if(modaltype==ModalTypes.RELATION || isReadonly){
      return 
    }
    let column = data.getColumn(columnKey);
    let currentUser = data.getCurrentUser();
    let currentStatus = column.statusConfig && column.statusConfig.statusValues.filter(item=>item.conditionValue == value)[0];
    let mergePersonColumn = column.statusConfig && column.statusConfig.mergePersonColumn;
    let adminFlag = column.statusConfig && column.statusConfig.adminFlag;
    if(currentStatus){
      if(currentStatus.anyoneElse||adminFlag){
        this.setState({
          personSet:true
        })
      }else if(mergePersonColumn){
        let rowData = data.getObjectAt(rowIndex),personAll=[];
        let cellValue = rowData[mergePersonColumn] && rowData[mergePersonColumn].value;
        if(cellValue){
          personAll = cellValue.split(',');
        }
  
        if(!currentUser || personAll.indexOf('S'+currentUser.id)==-1){
          this.setState({
            personSet:false
          })
          return 
        }
      }

    }
    if(column.statusConfig){
      if(currentStatus  && currentStatus.buttonflowModel.length>0){
        let buttonflowModel = currentStatus.buttonflowModel.map(item=>{
          return <Button size='small' onClick={(e)=>{this.submitButton(e,item)}} style={{color:item.buttonColor,borderColor:item.buttonColor}}>{item.buttonName}</Button>
        })
        this.setState({
          buttonflowModel:buttonflowModel,
          usingButton:true,
          personSet:false
        })
      } 
    }
  } 

  isRequired =()=>{
    let {  columnKey ,data,rowIndex} = this.props;
    let { value} = this.state;
    let columns = data.getColumns();
    let column = columns.find((column) => column.columnKey == columnKey);
    let rowData = data.getObjectAt(rowIndex);
    let currentStatus = column.statusConfig && column.statusConfig.statusValues.filter(item=>item.conditionValue == value)[0];
    let conditionModel = currentStatus && currentStatus.conditionModel;
    if(conditionModel && conditionModel.necessarilyColumnIDs && conditionModel.necessarilyColumnIDs.length>0){
      for(var i=0;i<conditionModel.necessarilyColumnIDs.length;i++){
        let item = conditionModel.necessarilyColumnIDs[i];
        if(!rowData[item] || !rowData[item].value || JSON.stringify(rowData[item].value)=='[]'){
          let curColumn = columns.find((column) => column.columnKey == item);
          curColumn &&  message.error(curColumn.name+' 列为必填项');
          return false;
        }
      }
    }
    return true;
  }
  submitButton=(e,info)=>{
    const { t } = this.props;
    if(!this.isRequired()){
      return;
    }
    if (info.redo) {
      Modal.confirm({
        content: t('TooltipMsg.redo_comfirm_tip'),
        okText: t('Buttons.commmit'),
        cancelText: t('Buttons.cancel'),
        onOk: ()=>{
          if(info && info.targetValue){
          this.handleMenuClick(info.targetValue,e)
        }}
      });
      return;
    }
    if(info && info.targetValue){
      this.handleMenuClick(info.targetValue,e)
    }
  }
  mouseLeave =()=>{
    this.setState({
      usingButton:false
    })
  }
  render() {
    const {
      data,
      rowIndex,
      columnKey,
      collapsedRows,
      callback,
      handleChange,
      handleCellEdit,
      handleCellEditEnd,
      handleKey,
      displayValue,
      isReadonly,
      color,
      ...props
    } = this.props;

    const { value ,usingButton,buttonflowModel,personSet} = this.state;
    const { t } = this.props;
    const dismiss = (visible) => {
      if (this.props.isReadonly || !personSet) {
        return;
      }
      this.setState({Statusvisible:visible})

      if (!visible) {
        handleCellEditEnd();
        this.setState({ isEdit: false });
      } else {
        handleCellEdit(ColumnType.STATUS);
        this.setState({ isEdit: true });
      }
    };
    const item_lineheight_style = {
      lineHeight: '30px',
      fontWeight: 400,
      display:'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
    };
    return (
      <Cell {...props} className='statusCell'>
        <Dropdown
          // disabled = {false}
          overlay={this.getStatusMenu}
          trigger={['click']}
          onVisibleChange={dismiss}
          visible={this.state.Statusvisible}
          getPopupContainer={(trigger) =>
            this.props.container ? this.props.container : trigger.parentElement
          }
          overlayClassName='status_color_select'
        >
          {/* 由于卷角用了绝对定位absolute，所以会寻找relative定位的父元素 */}
          <div style={{ position: 'relative' }} onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
            <div
              className="statusWidth"
              style={{
                background: value ? this.getStatusObjByID(value).color : '#c4c4c4',
                ...item_lineheight_style,
              }}
            >
              {usingButton && buttonflowModel}
              {!usingButton &&(value ? (
                this.getStatusObjByID(value).value
              ) : (
                <span></span>
              ))}
            </div>
          </div>
        </Dropdown>
        <Modal
          title="Modal"
          visible={this.state.redoVisible}
          // onOk={this.hideModal}
          // onCancel={this.hideModal}
          okText="确认"
          cancelText="取消"
        >
          <p>Bla bla ...</p>
          <p>Bla bla ...</p>
          <p>Bla bla ...</p>
        </Modal>
      </Cell>
    );
  }
}

export { StatusCell };
