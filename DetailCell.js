import React from 'react';
import { AppstoreOutlined } from '@ant-design/icons';
import { Modal, Button} from 'antd';
import './DetailCell.less';
import {DetailModel, FlowFormType,WorkflowTypes} from '../../../agileForms/enum/Enum';

class DetailCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible:false,
      value:props.value,
      projectPlanVisible:false,
      projectPlanContent:null,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {rowIndex,value}=nextProps;  
    if (value!=prevState.value ||rowIndex != prevState.rowIndex) {
      return {
        value: value,
        rowIndex: nextProps.rowIndex,
      }
    }
    return null;
  }

  handleCancel = () => {
    this.setState({
      visible:false
    });
  }

  showDetailModal = () => {
    const { onTabClose } = this.props;
    if(this.props.isReadonly){
      return;
    } 
    const { value } = this.state;
    const array = value.split("::");
    const type = array[0];
    // const objectId = array[1];
    // const taskId = array[2];
    const taskId = array[1];
    let todo;
    let workflow = {
      // apiName:objectId
      apiName:taskId
    };
    if(type==="FLOW"){
      workflow.type = DetailModel.WORK_FLOW;
      todo = FlowFormType.FLOW_FORM_DETAIL;
      let result = this.props.openWorkflowForm(workflow,todo,taskId,onTabClose,this.handleCancelWorkflowClick);
      this.setState({
        workflowVisible:true,
        workflowContent:result.workflowContent,
        workflowObject:result.workflowObject
      }) 
    }else if(type === "CREATE_TASK_FLOW"){
      workflow.type = DetailModel.WORK_FLOW;
      todo = FlowFormType.FLOW_FORM_CREATE;
      let result = this.props.openWorkflowForm(workflow,todo,taskId,onTabClose,this.handleCancelWorkflowClick);
      this.setState({
        workflowVisible:true,
        workflowContent:result.workflowContent,
        workflowObject:result.workflowObject
      }) 
    }else{
      this.props.onTabCreate({
        // key:objectId,
        key:taskId,
        type:DetailModel.PROJECT_PLAN,
        title:"项目计划编制"
      });
    }
    
  };

  handleCancelWorkflowClick = () => {
    this.setState({
      workflowVisible:false,
    });
  }
  render() {
    const { value,workflowVisible, workflowContent, workflowObject } = this.state;
    let showDetailBtn = value&&value!=''?true:false;
    const array = value?value.split("::"):['',''];
    const type = array[0];
    let title = "";
    if(workflowObject){
       const wf = WorkflowTypes.find((w) => w.apiName === workflowObject.apiName);
       if(wf){
         title = wf.name;
       }else{
         title = "流程信息";
       }
    }
    return (
      <div className="detailLayout">
        {
          showDetailBtn&&<Button 
          type="dashed" 
          size="small" 
          icon={<AppstoreOutlined />}
          onClick={this.showDetailModal}
        >
          {type==="FLOW"||type==="CREATE_TASK_FLOW"?"流程":"详情"}
        </Button>
        }
        <Modal
            title={
              workflowObject&&workflowObject.type===DetailModel.WORK_FLOW?title:"项目计划编制"
            }
            width={1200}
            footer={null}
            centered={true}
            maskClosable={false}
            bodyStyle={{overflow:'auto',height:'550px',padding:'3px 5px'}}
            visible={workflowVisible}
            onCancel={this.handleCancelWorkflowClick}
            destroyOnClose={true}
        >
          {workflowContent}
        </Modal>
 
      </div>
      
    );
  }
}

export { DetailCell };
