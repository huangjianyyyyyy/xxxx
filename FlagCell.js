import React from 'react';
import './FlagCell.less';
import {FlagIcon} from "../../../icons/FlagIcon"
class FlagCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value:props.value,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {columnKey,rowIndex,data} = nextProps;  
    let value = data.getCellValue(rowIndex, columnKey)||'';
    if (rowIndex != prevState.rowIndex) {
      return {
        value: value,
        rowIndex: nextProps.rowIndex,
      }
    }
    return null;
  }

  render() {
    const { value } = this.state;  
    return (
      <div className="flagLayout">
         {
           value!="N"&&<FlagIcon />
         }
      </div>
      
    );
  }
}

export { FlagCell };
