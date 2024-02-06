import React, { useState } from 'react';
import { Row, Col, Checkbox,  Popover } from 'antd';
// import './LockCell.less';
import './SelectCheckboxCell.less';

const SelectCheckboxCell = (props) => {
  const { columnData , edit} = props;

  const [selectColumn, setSelectColumn] = useState(props.value?.split(","));

  const handleCheckboxChange = (checkedValue) => {
    let option = { label: props.type };
    setSelectColumn(checkedValue);
    props.handleChange(checkedValue.join(','), option);
  };
  const getColumsContent = () => {
    return (
      <>
        <Checkbox.Group style={{ width: 130 }} onChange={handleCheckboxChange} value={selectColumn} disabled={edit?false:true}>
          <Row>
            {columnData &&
              columnData.map((item) => {
                return (
                  <Col span={24}>
                    <Checkbox value={item.id}>
                      <span
                        className='rule-checkbox-span'
                        style={{ background: item.color }}
                      />
                      {item.value}
                    </Checkbox>
                  </Col>
                );
              })}
          </Row>
        </Checkbox.Group>
      </>
    );
  };

  const getColorByID  = (ID) => {
    const item = columnData && columnData.find((ele) => {
      return ele.id == ID;
    });
    return item && item.color
  }

  return (
    <Popover
      content={getColumsContent()}
      overlayClassName='rule-card-popover'
      placement='bottomLeft'
      trigger='click'
    >
      {selectColumn && selectColumn.length > 0 ? (
        <span style={{margin:"0 10px"}}>
        {selectColumn.map(ele=>(
          <span className='rule-checkbox-display' style={{background:getColorByID(ele)}}></span>
        ))}
        </span>
      ) : (
        <span
          className="rule-text-display"
        >
          {props.text}
        </span>
      )}
    </Popover>
  );
};
export default SelectCheckboxCell;
