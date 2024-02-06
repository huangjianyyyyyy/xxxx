import React from 'react';
import { CheckOutlined } from '@ant-design/icons';
import { RelationCellToCell } from './RelationCellToCell';
import './CheckBoxCell.less';
import {  getPynboBoardFlag  } from '../taskcolumns/TaskColumns';
import { ModalTypes } from "../../../maintable/data/MainTableType";

class CheckBoxCell extends React.Component {
  constructor(props) {
    super(props);
    let isChecked = props.value || 'false';
    isChecked = isChecked != 'false' ? true : false;
    this.state = {
      isCheckedBox: isChecked,
      rowId:props.rowId,
    };
  }
  changeStatus = (isCheckedBox) => {
    const { rowIndex, isReadonly ,modalType} = this.props;
    let boardType = this.props.data.getBoardType();
    
    this.props.handleChange(!isCheckedBox, true);
    if (rowIndex) {
      if (isReadonly) {
        return;
      }
      if(!getPynboBoardFlag(boardType)){
        const relationCellToCell = new RelationCellToCell(this.props);
        relationCellToCell.relationIsStartUpdateActualDate(!isCheckedBox,modalType==ModalTypes.MATTER);
      }
     
    }
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const {rowIndex,value}=nextProps;  
    let isChecked = value || 'false';
    isChecked = isChecked != 'false' ? true : false;
    if (isChecked != prevState.isCheckedBox|| rowIndex!=prevState.rowIndex) {
      return {
        rowIndex:rowIndex,
        isCheckedBox: isChecked,
      };
    }
    return null;
  }

  render() {
    const { isCheckedBox } = this.state;
    return (
      <div
        className="checkBoxLayout"
        onClick={this.changeStatus.bind(this, isCheckedBox)}
      >
        {isCheckedBox && <CheckOutlined className="checkbox_fineshed" />}
        {!isCheckedBox && <div className="checkbox_nofineshed"></div>}
      </div>
    );
  }
}

export { CheckBoxCell };
