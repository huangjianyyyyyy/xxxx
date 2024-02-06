import React from 'react';
import './LinkStatusCell.less';
import {Popover, Tooltip} from 'antd';
import {  withTranslation } from 'react-i18next';
import {TaskColumns,TaskStatus} from '../taskcolumns/TaskColumns';
import {DataRowHeaderLinkCell} from '../../../maintable/MainTableDataColumns';
import FixedDataTableCellDefault from '../../../maintable/FixedDataTableCellDefault'
import {DataVersionContext} from '../../../maintable/data/DataContext';
import {StatusCellProperties} from '../../../helpers/columnlib/cell/CellProperties';
import {DataViewWrapper} from '../../../maintable/data/DataViewWrapper';
import {RowType, ColumnType,ModalTypes,parseBoardViewId} from '../../../maintable/data/MainTableType';

@withTranslation()
class LinkStatusCell extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // rows: [],
      // boardId: '',
      isLoading: true,
      // showPopover: false,
      data: null, /// subtask dataview,
      version: 0,
    };
  }

  componentDidMount(){ 
    const rowData = this.props.data.getObjectAt(this.props.rowIndex);
    const value = rowData && rowData[TaskColumns.Column_Subtask];
    if (!this.props.value) {
      //const curBoardView = this.props.data._dataset._curBoardView;
      const bv = parseBoardViewId(this.props.data._boardId);
      if (value) {
          // this.setState({isLoading: true});
          this.props.data._dataset.fetchBoardData(value.value, bv.viewId, this.setMenus, this.setLoading);
          console.log('reload status');          
      } else {
        this.props.data.setObjectAt(this.props.rowIndex, this.props.columnKey, [], true);
      }
    } 
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.refreshRowIndex === this.props.rowIndex && this.state.version !== this.props.version) {
      // const curBoardView = this.props.data._dataset._curBoardView;
      const bv = parseBoardViewId(this.props.data._boardId);
      const rowData = this.props.data.getObjectAt(this.props.rowIndex);
      const value = rowData && rowData[TaskColumns.Column_Subtask];
      this.setState({isLoading: true, version: this.props.version}, () => {
        this.props.data._dataset.fetchBoardData(value.value, bv.viewId, this.setMenus, this.setLoading);
      });
    }    
  }

  setLoading = (isLoading) => {
    // this.setState({
    //   isLoading: isLoading,
    // });
  }

  setMenus = (menus, isBoard, defaultBoard) => {
    let rows = [];
    // later it should fetch sum from backend
    let groups = this.props.data._dataset.getGroups(defaultBoard.id);
    groups.forEach(group => group.rows.forEach(row => {
      if (this.props.data._dataset.getObjectAt(defaultBoard.id, row.id)[TaskColumns.Column_Status].value !== String(StatusCellProperties.CANCEL.key)) {
         rows.push({rowType:RowType.ROW, rowKey:row.id})
      }      
    }));
    this.props.data.setObjectAt(this.props.rowIndex, this.props.columnKey, rows, true);  
    this.setState({
        // rows: rows,
        isLoading: false
    });
  }

  /**
   * 弹出层高度
   * @param {*} type
   * @param {*} height
   */
   handleCellEdit = (type, height) => {
    if (this.state.isReadonly) {
      return false;
    }
    if (this.props.onCellEdit) {
      let popupHeight = (height ? height : this.popupHeights[type]) + 20;
      this.props.onCellEdit(
        this.props.rowIndex,
        this.props.columnKey,
        popupHeight
      );
    }
    return true;
  }

  handleCellEditEnd = () => {
    if (this.props.onCellEditEnd) {
      this.props.onCellEditEnd(this.props.rowIndex, this.props.columnKey);
    }
  }

  _renderCell = (
    data,
    /*number*/ i, 
    /*number*/ rowIndex,
    /*number*/ rowKey,
    /*object*/ cellTemplate,
    /*key*/ columnKey
  ) /*object*/ => {

    let cellProps = {
        columnKey,
        onCellEdit: null,
        onCellEditEnd: null,
        container: this.props.container,
        data: data,
        rowIndex,
        rowKey
    };

    let content;
    if (React.isValidElement(cellTemplate)) {
      content = React.cloneElement(cellTemplate, cellProps);
    } else if (typeof cellTemplate === 'function') {
      content = new cellTemplate(cellProps);
    } else {
      content = (
        <FixedDataTableCellDefault
          {...cellProps}>
          {cellTemplate}
        </FixedDataTableCellDefault>
      );
    } 

    let group = data.getGroupByRowIndex(rowIndex);
    let groupColor = group ? group.color : '#f1f3f5';
    let css_style = {
      borderLeft: '3px solid ' + groupColor,
    };
    return (
        <div className="link_row_wrapper" key={i} style={css_style}>         
          <div className="link_row_component_wrapper">{content}</div>         
        </div>
    );
  }

  handleChangeVisible = (visible) => {
    // 消失时保存数据
    if (!visible) {
      this.handleCellEditEnd();
    } else {
      this.handleCellEdit(ColumnType.SUBTASKSTATUS);
    }
  }
  
  getStatusText = (key) => {
    const { t } = this.props;
    let statusName;
    if(key === TaskStatus.NOT_STARTED_STATUS){
      statusName = t('Group.Status.Not_Started');
    }else if(key === TaskStatus.STARTED_STATUS){
      statusName = t('Group.Status.Started');
    }else if(key === TaskStatus.CLOSED_STATUS){
      statusName = t('Group.Status.Done');
    }else if(key === TaskStatus.CANCEL_STATUS){
      statusName = t('Group.Status.Cancelled');
    }
    return statusName;
  }

  // find link dataset
  getPopover = (data, status) => {
    const rows = this.props.value;
    const width = 240;
    const { t } = this.props;
    var cells = [];
    const isFinished = status.style.statusName === t('Column.Status.Done');
    let modalType = this.props.modalType==ModalTypes.RELATION?true:false;
    if (!rows || rows.length === 0) {
      return;
    }

    for(let i = 0; i < rows.length; i++){
      let row = rows[i];
      if (!row.rowKey) {
        continue;
      }
      if (isFinished && data.getObjectAt(i)[TaskColumns.Column_Status].value === String(StatusCellProperties.FINISHED.key)) {
        cells[i] = this._renderCell(data, i, i, row.rowKey, DataRowHeaderLinkCell, TaskColumns.Column_Description);
      } else if (!isFinished && data.getObjectAt(i)[TaskColumns.Column_Status].value !== String(StatusCellProperties.FINISHED.key)) {
        cells[i] = this._renderCell(data, i, i, row.rowKey, DataRowHeaderLinkCell, TaskColumns.Column_Description);
      }
    }

    const handleCellEnter = () => {
        this.handleCellFocus(true);
    };

    const handleCellLeave = () => {
        this.handleCellFocus(false);
    };

    return (     
      <Popover
          disabled={modalType}
          placement="bottomRight"
          trigger="click"
          destroyTooltipOnHide="true"
          autoAdjustOverflow={false}
          onVisibleChange={this.handleChangeVisible}
          getPopupContainer={(trigger) => this.props.container ? this.props.container : trigger.parentElement}
              content={
                <DataVersionContext.Provider value={this.state} >
                  <div
                    style={{ pointerEvents: 'visible', width }}
                    onMouseEnter={handleCellEnter}
                    onMouseLeave={handleCellLeave}
                  >
                    <div
                      className="rows_scroll"
                      style={rows.length === 5 ? { overflowY: 'scroll' } : {}}>
                      {cells}
                    </div>
                  </div>
                </DataVersionContext.Provider>
              }
              title={
                <div style={{ pointerEvents: 'visible', width }}>
                  <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '10px', display: 'flex', flexWrap: 'wrap' }}>
                    {isFinished && t('Column.Status.Done')+' -' || !isFinished && t('Column.Status.unFinished')+' -' }
                    {Math.round(cells.length / rows.length * 100) + '%'}
                    &nbsp;&nbsp;&nbsp;
                    <div style={{color:'gray', fontSize:'small'}}>
                      {'(' +cells.length + '/' + rows.length + ')'}
                    </div>
                  </div>
                </div>
              }>
            <div key={status.style.background} className="link_status_summary" style={status.style}></div>
          </Popover>);
  }

  getLinkStatusSummary = (data) => {
    const { t } = this.props;
    const rows = this.props.value;
    //const rows = this.props.value;

    var statusPercent = [];
    if (rows && rows.length > 0) {
      let statusObject = {
        finished : { finishedCount : 0, finishedPercent : 0},
        unfinished : { unfinishedCount : 0, unfinishedPercent : 0}
      }

      for(let i = 0; i < rows.length; i++) {
        let statusValue = data.getObjectAt(i)[TaskColumns.Column_Status].value;
        if (statusValue === String(StatusCellProperties.FINISHED.key)) {
          statusObject.finished.finishedCount ++;
        } else {
          statusObject.unfinished.unfinishedCount ++;
        }      
      }

      for(let key in statusObject){
        statusObject[key][key+'Percent'] = Number((statusObject[key][key+"Count"] /rows.length).toFixed(2));
        const properties = StatusCellProperties[key.toUpperCase()];
        statusPercent.push({
          style: {
            fraction:statusObject[key][key+"Count"]+ "/" +rows.length,
            statusName: properties ? this.getStatusText(properties.key) : t('Column.Status.unFinished'),
            width: Math.round(statusObject[key][key+'Percent'] * 100) + '%',
            background: properties ? properties.color : '#c4c4c4'
          }
        });
      }
    }
    return statusPercent;
  }

  render() {
    const rowData = this.props.data.getObjectAt(this.props.rowIndex);
    const boardId = rowData && rowData[TaskColumns.Column_Subtask];
    const dv = parseBoardViewId(this.props.data._boardId);
    const boardViewId = boardId + '-' + dv.viewId;
    const rows = this.props.value;

    if (!rows || rows.length === 0 || !boardId) {
      return null;
    }

    let data = new DataViewWrapper({
      boardId: boardViewId, 
      dataset:this.props.data._dataset, 
      indexMap:rows,
      isFilterRequired:false});
      
    // 状态列
    // 获取每个状态占的百分比
    let statusPercent = this.getLinkStatusSummary(data);
    return (
        <div className="link_summary_cell">
          <div className="link_summary_cell_status_container">
            {statusPercent.map((status, index) => {
              let tooltipText = status.style.statusName + ' ' + status.style.fraction + '   ' + status.style.width;
              return <Tooltip key={index} placement="top" title={tooltipText.trim()} arrowPointAtCenter>
                  {this.getPopover(data, status)}
                </Tooltip>;
            })}
          </div>
        </div>
      );
    
  }
}

export {LinkStatusCell};
