import React ,{ useState,useEffect }from "react";
import {
  Row,
  Col,
  Checkbox,
  Divider,
  Popover,
  
} from "antd";
import {DownOutlined} from '@ant-design/icons';
import { ColumnType } from "../../../maintable/data/MainTableType";
import './LockCell.less';

const LockColumnCell = (props) => {
  let {  record ,columnsList } = props;
  let columns = [],columnKeys=[],lockingColumns=[],columnNames=[];

  const getLockingColumns=()=>{
    columnNames=[];
    lockingColumns = (record.conditionModel && record.conditionModel.lockingColumns)??[];
    lockingColumns && (lockingColumns = lockingColumns.map(item=>{return item.targetColumn || item }));
    columnsList.map(item=>{     
        if(item.columnComponentType != ColumnType.NONE && item.columnComponentType != ColumnType.HIDDEN){
            columns.push(item);
            columnKeys.push(item.id);
            if(lockingColumns && lockingColumns.includes(item.id)){
              columnNames.push(item.name);
          } 
        }
    })
  }
  getLockingColumns();
  const [checkAll, setCheckAll] = useState(lockingColumns.length==columns.length);
  const [columnName, setColumnName] = useState(columnNames);
  const [checkedList, setCheckedList] = useState(lockingColumns);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getLockingColumns();
    setColumnName(columnNames);
    setCheckedList(lockingColumns);
  }, [record.lockingColumns]);


  const onChange = (list) => {
    setCheckedList(list);
    let columnName = [];
    columns.map(item=>{
        if(list.includes(item.id)){
            columnName.push(item.name) 
        } 
    });
    record.conditionModel.lockingColumns=list;
    record.conditionModel.lockingColumnIDs=list;
    setColumnName(columnName)
    setCheckAll(list.length === columns.length);
  };
const onCheckAllChange = e => {
    e.stopPropagation();
    e.preventDefault();
    let columnName = [];
    columns.map(item=>{
      columnName.push(item.name) 
    });
    record.conditionModel.lockingColumns=e.target.checked ? columnKeys : [];
    record.conditionModel.lockingColumnIDs=e.target.checked ? columnKeys : [];
    setColumnName(e.target.checked ? columnName : [])
    setCheckedList(e.target.checked ? columnKeys : []);
    setCheckAll(e.target.checked);
  };
  const getColumsContent =()=>{
    let necessarilyColumnIDs = (record.conditionModel && record.conditionModel.necessarilyColumnIDs)??[];
    return (
        <>
             <Checkbox.Group style={{ width: '100%' }} value={checkedList} onChange={onChange} >
                <Row>
                    {
                        columns.map(item=>{
                            return (
                                <Col span={24}>
                                    <Checkbox value={item.id} disabled={necessarilyColumnIDs.indexOf(item.id)!=-1}>{item.name}</Checkbox>
                                </Col>
                            )
                        })
                    }
                </Row>
            </Checkbox.Group>
            <Divider />
            <Checkbox  onChange={onCheckAllChange} checked={checkAll} defaultChecked={checkAll}>
                全选
            </Checkbox>
          

        </>
      );
}
const visibleChange=(visible)=>{
  setVisible(visible);
}
  return (
    <Popover 
      content={visible && getColumsContent()}   
      placement="right" 
      trigger='click'
      arrowPointAtCenter='true'
      onVisibleChange={(e)=>{visibleChange(e)}}
      overlayStyle={{
        width:'200px'
      }} 
      overlayInnerStyle={{
        maxHeight:"500px",
        overflow:"auto"
      }}
    >
        {<div>
          {columnName.length>0 &&<span className='lockColumnCell'>
            {(checkAll || (columnKeys.length ==columnName.length))?'所有列':columnName.join(',')}
          </span>}
          {columnName.length==0 &&<span className='lockColumnCell' style={{color:'#c0c0c0'}}>
            {'+锁定列'}
          </span>}
          <DownOutlined />  
        </div>} 
    </Popover>
  );
};
export default LockColumnCell;
