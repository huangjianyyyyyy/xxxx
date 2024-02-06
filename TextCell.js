import React, {useState,useEffect}from 'react';
import {Input} from 'antd';
import {Cell} from '../../../maintable/FixedDataTableRoot';
import './TextCell.less';

function TextCell(props) {
  const [inputValue,setValue] = useState(props.value);
  useEffect(()=>{
    props.handleChange(inputValue, false);
  },[inputValue])
  return (
      <Cell className="textCell">
        <Input
          autoFocus={true}
          value={inputValue}
          size="small"
          onChange={(e)=>{setValue(e.target.value)}}
          onKeyDown={props.handleKey}
        />
      </Cell>
  );
}
export default TextCell;
