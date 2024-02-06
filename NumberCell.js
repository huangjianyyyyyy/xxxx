import React,{useState} from 'react';
import { Input } from 'antd';
import {Cell} from '../../../maintable/FixedDataTableRoot';
import './NumberCell.less';

function NumberCell(props) {
  const [inputValue,setValue]=useState(props.value);
  function inputChange (value){
    value = value ? value.trim() : '';
    let reg = /^[0-9-.]*$/g;
    if ((!Number.isNaN(value) && reg.test(value)) || value === '') {
      // 如果包含-必须在开头，包含.则不能在开头且只能有一个
      if (value.indexOf('-') !== -1) {
        if (!value.startsWith('-') || (value.split('-').length > 2) || value.startsWith('-.')) {
          return
        }
      }
      if (value.indexOf('.') !== -1) {
        if (value.startsWith('.') || (value.split('.').length > 2)) {
          return
        }
      }
      setValue(value)
      props.handleChange(value, false);
    }
  }
  return (
    <Cell className="NumberCell">
      <Input
        className="NumberCell"
        size="small"
        value={inputValue}
        onChange={(e)=>{
          inputChange(e.target.value)
        }}
        onPressEnter={props.handleKey}
        autoFocus={true}
      />
    </Cell>
  );
}

export default NumberCell;
