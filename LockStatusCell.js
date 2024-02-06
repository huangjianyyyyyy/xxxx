import React from 'react';
import { Menu, Dropdown } from 'antd';
import { withTranslation } from 'react-i18next';
import { Cell } from '../../../maintable/FixedDataTableRoot';
import './StatusCell.less';
import { getTodoBoardFlag } from '../taskcolumns/TaskColumns';
import { ColumnType } from '../../../maintable/data/MainTableType';
import StatusGridCell from './StatusCell/StatusGridCell';

@withTranslation()
class LockStatusCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rowIndex: props.rowIndex,
      isEdit: true,
      value: props.value, 
      Statusvisible:false
    };
  }

  getStatusMenu = () => {
    const {  data, columnKey , boardId,isColumnReadonly  } = this.props;
    const StatusListData = data._columnData[boardId] && data._columnData[boardId][columnKey];
    const menu = (
      <Menu className='statusCellMenu' style={{ pointerEvents: 'visible' }}>
        {
          <StatusGridCell
            onhandleMenuClick={this.handleMenuClick}
            StatusListData={StatusListData}
            isColumnReadonly={isColumnReadonly}
            {...this.props}
            isEdit={false}
          />
        }
      </Menu>
    );
    return menu;
  };

  getStatusObjByID = (ID) => {
    const { data, columnKey,value,color,boardId } = this.props;

    let board = data._workspace[boardId]
    if (board && getTodoBoardFlag(board.boardType)) {
      let item ={}
      item["value"]=value
      item["color"]=color
      return item
    }else{
      const StatusListData =
      data._columnData && data._columnData[boardId] && data._columnData[boardId][columnKey];
      const item = StatusListData && StatusListData.find((ele) => {
        return ele.id == ID;
      });
      return item ? item : '';
    }
    
  };

  handleMenuClick = (id, e) => {
    const { record,isAddTodo ,isPushChangeDate} = this.props;
    this.setState({Statusvisible:false})
    const selectedKey = id;
    const selectedStyle = ".workingItem";
    this.setState({
      value: selectedKey,
      originalValue: selectedKey,
      styleClassName: selectedStyle,
    });
    if(record){
      record.conditionValue = selectedKey;
      if(!isAddTodo){
        isPushChangeDate(record);
      }
    }
    if (this.props.rowIndex) {
      e.stopPropagation();
    }
  };
  componentDidUpdate(prevProps, prevState) {
    let { value, rowIndex } = this.props;
    if ((value != prevState.originalValue || rowIndex != prevState.rowIndex)&&!this.props.isColumnReadonly) {
      this.setState({
        value: value,
        originalValue: value,
        rowIndex: rowIndex,
      });
    }
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

    const { value } = this.state;
    const { t } = this.props;
    const dismiss = (visible) => {
      if (this.props.isReadonly) {
        return;
      }
      this.setState({Statusvisible:visible})

      if (!visible) {
        handleCellEditEnd && handleCellEditEnd();
        this.setState({ isEdit: false });
      } else {
        handleCellEdit && handleCellEdit(ColumnType.STATUS);
        this.setState({ isEdit: true });
      }
    };
    const item_lineheight_style = {
      lineHeight: '30px',
      fontWeight: 400,
    };
    return (
      <Cell {...props} className='statusCell'>
        <Dropdown
          overlay={this.getStatusMenu}
          trigger={['click']}
          onVisibleChange={dismiss}
          visible={this.state.Statusvisible}
          overlayClassName='status_color_select'
        >
          <div style={{ position: 'relative' }}>
            <div
              className="statusWidth"
              style={{
                background: value ? this.getStatusObjByID(value).color : '#c4c4c4',
                ...item_lineheight_style,
              }}
            >
              {value ? (
                this.getStatusObjByID(value).value
              ) : (
                <span></span>
              )}
            </div>
          </div>
        </Dropdown>
      </Cell>
    );
  }
}

export { LockStatusCell };
