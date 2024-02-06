import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Checkbox,
  Popover,
} from "antd";
import { ColumnType } from "../../../maintable/data/MainTableType";
import {CloseCircleFilled,DownOutlined} from '@ant-design/icons';

const LockSelectCell = (props) => {
  const { record ,columnsList ,isChangeDate,IsInvalid,dataSource} = props;
  let peopleColumn = columnsList && columnsList.filter(
    (item) => (item.columnComponentType === ColumnType.PEOPLESEARCH || item.columnComponentType === ColumnType.PEOPLESEARCHSINGLE)
  );

  peopleColumn.unshift({
    name:'任意人员',
    id:'0',
  })


  let columns = [],columnKeys=[],personColumnModel,columnNames=[];

  const getLockingColumns=()=>{
    columnNames=[];
    personColumnModel = record.personColumnModel;
    personColumnModel && (personColumnModel = personColumnModel.map(item=>{return item.personColumn || item }));
    peopleColumn.map(item=>{     
      columns.push(item);
      columnKeys.push(item.id);
      if(personColumnModel && personColumnModel.includes(item.id)){
        columnNames.push(item.name);
      } 
        
    })
  }

  useEffect(() => {
    getLockingColumns();  
    setColumnName(columnNames);
    setCheckedList(personColumnModel);
  }, [dataSource]);
  const [columnName, setColumnName] = useState(columnNames);
  const [checkedList, setCheckedList] = useState(personColumnModel);

  const onChange = (list) => {
    let InvalidIndex = list.indexOf('0');
    if(InvalidIndex!=-1){
      if(list[list.length-1]!='0'){
        list.splice(InvalidIndex,1);
      }else{
        list = ['0'];
      }
    }
    record.personColumnModel = list;
    setCheckedList(list);
    let columnName = [];
    columns.map(item=>{
        if(list.includes(item.id)){
            columnName.push(item.name) 
        } 
    });
    isChangeDate(IsInvalid,list)
    setColumnName(columnName)
  };

  const clearEvent=(e)=>{
    e.stopPropagation();
    record.personColumnModel = [];
    setCheckedList([]);
    setColumnName([]);
  }
  const getColumsContent =()=>{
    return(
        <>
             <Checkbox.Group style={{ width: '100%' }} value={checkedList} onChange={onChange} >
                <Row>
                    {
                        peopleColumn.map(item=>{
                            return (
                                <Col span={24}>
                                    <Checkbox value={item.id}>{item.name}</Checkbox>
                                </Col>
                            )
                        })
                    }
                </Row>
            </Checkbox.Group>
        </>
      );
}
  return (
    <Popover 
      content={getColumsContent()}   
      placement="bottomLeft" 
      trigger='click'
      overlayStyle={{
        width:'200px'
      }} 
    >
        {columnName.length>0&&<div className='personBox'> 
          <span className='lockColumnCell'>{columnName.join(',')}</span>
          <CloseCircleFilled  onClick={clearEvent} />  
        </div>} 
        {columnName.length==0&&<div className='personBox'>
          <span className='lockColumnCell' style={{color:'#c0c0c0'}}>{'无'}</span>
          <DownOutlined />  
        </div>} 
    </Popover>
  );
};
export default LockSelectCell;
