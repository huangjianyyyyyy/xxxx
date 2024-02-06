import React,{ useState} from "react";
import {
  Popover ,
  Table,
  Button,
} from "antd";
import LockButtonStatus from "./ToDoLock/LockButtonStatus";
import LockButtonType from "./ToDoLock/LockButtonType";
import {
  PlusOutlined,
  CloseCircleFilled,
} from '@ant-design/icons';
import './LockCell.less';
const LockSwitchCell = (props) => {
  const {  buttonflowInputs, record, dataSource ,columnsList ,StatusListData} = props;


  let initValue=[
    {
      id: 1,
      buttonSet:[{
        id: 1,
        buttonName:'提交',
        buttonColor:'#1890ff',
        targetValue:null,
        redo:false,
      }],
    },
    {
      id: 2,
      buttonSet:[{
        id:2,
        buttonName:'同意',
        buttonColor:'#3fab0a',
        targetValue:null,
        redo:false,
      },{
        id:2,
        buttonName:'退回',
        buttonColor:'#d21447',
        targetValue:null,
        redo:false,
      }],
    }
  ]
  
  let buttonName = buttonflowInputs&&buttonflowInputs.length>0?buttonflowInputs[0].buttonName:null;
  let buttonId = null;
  initValue.map(item=>{
    if(item.buttonSet[0].buttonName == buttonName){
      buttonId = item.id;
      item.buttonSet.map((button,index)=>{
        button.targetValue=buttonflowInputs[index].targetValue;
        button.redo=buttonflowInputs[index].redo;
      })
    }else{
      item.buttonSet.map((button)=>{
        button.targetValue=StatusListData[0].conditionValue;
      })
    }
  })
  const [checked, setChecked] = useState(buttonId);


  const changeRadio=(value,type)=>{
    record.buttonflowInputs = initValue[value-1].buttonSet;
    type && setChecked(value)
  }
  const buttonContent=()=>{

    let columns=[
      {
        id:'1',
        width:'50',
        name:'选择按钮类型',
      },
      {
        id:'2',
        width:'50',
        name:'点击跳转至状态',
      }
    ];

    columns = columns.map((col) => {
      return {
        title: col["name"],
        width: col.width,
        dataIndex: col["id"],
        render: handleColunmRender(col["name"], col["id"]),
      };
    });
    return (<Table
      pagination={false}
      bordered
      dataSource={initValue}
      columns={columns}
      size="small"
    />)
  }

  const handleColunmRender = (name, dataIndex) => {
    let data;
    switch (dataIndex) {
      case '1':
        data = (_, value, index) => {     
          return (  
              <LockButtonType
                  value={value}   
                  record={record}
                  columnsList={columnsList}
                  changeRadio={changeRadio}
              ></LockButtonType>
          );
        };
        break;
      case '2':
        data = (_, value, index) => {
          return (
            <div className="Table-edit-nameCell">
              {
                  <LockButtonStatus
                    value={value}
                    record={record}
                    StatusListData={StatusListData}
                    columnsList={columnsList}
                    changeRadio={changeRadio}
                  ></LockButtonStatus>
              }
            </div>
          );
        };
        break;
    }
    return data;
  };
  const clearButtonSet=(e)=>{
    e.stopPropagation();
    record.buttonflowInputs = [];
    setChecked(null);
  }
  const getContent =()=>{
    let data=[];
    if(checked){
      data = initValue[checked-1].buttonSet.map(item=>{
        return <Button size='small' style={{color:item.buttonColor,borderColor:item.buttonColor}}>{item.buttonName}</Button>
      })  
      data.push(<span><CloseCircleFilled  onClick={clearButtonSet}/></span>)
    }else{
      data.push(<span><PlusOutlined />操作按钮</span>)
    }
    return data
  }
  return (
    <Popover 
      placement="bottomLeft" 
      content={buttonContent} 
      trigger="click"
      overlayStyle={{width:'270px'}}
    >
      <div className='LockButtonSet'>
        {getContent()}
      </div>
    </Popover>
  );
};
export default LockSwitchCell;
