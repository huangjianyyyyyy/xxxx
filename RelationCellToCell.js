'use strict';

import moment from 'moment';
import {TaskColumns,TaskStatus,TaskStatusRank,TaskDateFormatStr,TaskMaturityRank,TaskViewList} from '../taskcolumns/TaskColumns';
import {getDayIsThisOrNextWeek} from '../taskcolumns/TaskDate';
import { CHANGE_STATUS } from '../../../maintable/MainTableRowKeyAndDesc';
import {parseBoardViewId} from '../../../maintable/data/MainTableType';

class RelationCellToCell {
    constructor(props){
       this.props = props;
    };

    proptypes = {
         DATE_TIME_DELIMIT : ' ',
         START_SPLIT_END : "TO",
         FORMATSTR: TaskDateFormatStr.DATE_FORMAT_STR,
    };

    /*
    *  @函数描述：获取三个相互关联的columnKey
    * 
    */
    getSomeColumnKeys = () => {
        return {
            isStartedColumnKey:String(TaskColumns.Column_Started),
            isFinishedColumnKey:String(TaskColumns.Column_Hidden_Status),
            planDateColumnKey:String(TaskColumns.Column_Scheduled_TimeSlot),
            actualDateColumnKey:String(TaskColumns.Column_Real_TimeSlot),
            statusColumnKey:String(TaskColumns.Column_Status)
        }
    };

    /*
    *  @函数描述：选择/清除实际开始日期，修改是否开始状态
    *  @函数参数：1：true/false保存实际开始日期/清除实际开始日期；2：是否是计划时间
    */
    actualDatechangeStartStatus = (status,isPlanDate) =>{
        const{rowIndex,columnKey,data} = this.props;
        const bv = parseBoardViewId(data._boardId);
        const rowData = data.getObjectAt(rowIndex);
        const columnKeys = this.getSomeColumnKeys();
        let isActualDate = columnKey===String(TaskColumns.Column_Real_TimeSlot)?true:false;
        let moveType;
        if(!isPlanDate&&isActualDate){
            const isStartedColumnKey  = columnKeys.isStartedColumnKey;
            const isFinishedColumnKey  = columnKeys.isFinishedColumnKey;
            const actualDateColumnKey = columnKeys.actualDateColumnKey;
            const statusColumnKey = columnKeys.statusColumnKey;
            const isStartedColumnValue = rowData[isStartedColumnKey] && rowData[isStartedColumnKey].value;
            let isStarted = isStartedColumnValue===true||isStartedColumnValue==="true"?true:false;
            if(status){
                if(!isStarted){
                  data._dataset.setCellValue(rowData[isStartedColumnKey],"true")
                  data._dataset.setCellValue(rowData[statusColumnKey],TaskStatus.STARTED_STATUS)
                   
                    //状态视图
                    if(TaskViewList.View_Status === bv.viewId * 1){
                      moveType = CHANGE_STATUS.sub_item_2.key;
                      this.changeRowsGroup(moveType);
                    //到期情况视图
                    }else{
                      this.maturityViewChangeGroupRows();
                    }
                }
            }else{
                if(isStarted){
                  data._dataset.setCellValue(rowData[isStartedColumnKey], "false")
                  data._dataset.setCellValue(rowData[statusColumnKey], TaskStatus.NOT_STARTED_STATUS)
                  data._dataset.setCellValue(rowData[isFinishedColumnKey],"false")
                  data._dataset.setCellValue(rowData[actualDateColumnKey],this.proptypes.DATE_TIME_DELIMIT+this.proptypes.START_SPLIT_END+this.proptypes.DATE_TIME_DELIMIT)
    
                  
                    if(TaskViewList.View_Status === bv.viewId * 1){
                      moveType = CHANGE_STATUS.sub_item_1.key;
                      this.changeRowsGroup(moveType);
                    }else{
                      this.maturityViewChangeGroupRows();
                    }
                }
            }      
        }
    };

    /*
    *  @函数描述：完成或未完成联动实际日期的结束时间
    *  @函数参数：是否完成
    */
    relationUpdateActualDate = (isFinished,modalType) =>{
        const {rowIndex, data} = this.props;
        const bv = parseBoardViewId(data._boardId);
        const rowData = data.getObjectAt(rowIndex);
        const columnKeys = this.getSomeColumnKeys();
        const actualDateColumnKey = columnKeys.actualDateColumnKey;
        const startColumnKey = columnKeys.isStartedColumnKey;
        const statusColumnKey = columnKeys.statusColumnKey;
        const planDateColumnKey = columnKeys.planDateColumnKey;
        // const planDateValue   = rowData[planDateColumnKey] && rowData[planDateColumnKey].value;
        const actualDateValue = rowData[actualDateColumnKey] && rowData[actualDateColumnKey].value||"";
        const startValue = rowData[startColumnKey] && rowData[startColumnKey].value||"false";
        const dateArray = actualDateValue.split(this.proptypes.START_SPLIT_END);
        let start = dateArray[0]?dateArray[0]:"", end = dateArray[1]?dateArray[1]:"";
        const endDateTimeValue = end.split(this.proptypes.DATE_TIME_DELIMIT);
        let endTimeValue = endDateTimeValue.length == 2 ? endDateTimeValue[1] : '';

        let newEndDateValue,moveType;
        //已完成
        if(isFinished==="true"){
            data._dataset.setCellValue(rowData[statusColumnKey], TaskStatus.CLOSED_STATUS)
            const now = moment().format(this.proptypes.FORMATSTR);
            const newEndDate = now+this.proptypes.DATE_TIME_DELIMIT+endTimeValue
            newEndDateValue = start+this.proptypes.START_SPLIT_END+newEndDate;
            //当点击已完成，是否开始自动打勾
            if(!startValue||startValue!="true"){
                const now = moment().format(this.proptypes.FORMATSTR);
                newEndDateValue = now+this.proptypes.DATE_TIME_DELIMIT+this.proptypes.START_SPLIT_END+now+this.proptypes.DATE_TIME_DELIMIT;
                data._dataset.setCellValue(rowData[startColumnKey], "true")
            }
            data._dataset.setCellValue(rowData[actualDateColumnKey], newEndDateValue)
            //状态视图
            if(!modalType){
              if(TaskViewList.View_Status === bv.viewId * 1){
                moveType = CHANGE_STATUS.sub_item_3.key;
                this.changeRowsGroup(moveType);
              }else{
                this.maturityViewChangeGroupRows();
              }
            }
            
        //未完成   
        }else{
            data._dataset.setCellValue(rowData[statusColumnKey], TaskStatus.STARTED_STATUS)
            newEndDateValue = start+this.proptypes.START_SPLIT_END+this.proptypes.DATE_TIME_DELIMIT;
            data._dataset.setCellValue(rowData[actualDateColumnKey], newEndDateValue)
            if(!modalType){
              if(TaskViewList.View_Status === bv.viewId * 1){
                moveType = CHANGE_STATUS.sub_item_2.key;
                this.changeRowsGroup(moveType);
              }else{
                this.maturityViewChangeGroupRows();
              }
            }
        } 
        
        
    };

    /*
    *  @函数描述：已开始或未开始联动实际日期的开始时间
    *  @函数参数：是否开始
    */
    relationIsStartUpdateActualDate = (isStarted,modalType) =>{
        let newStartDateValue,moveType;
        const {rowIndex, data} = this.props;
        const bv = parseBoardViewId(data._boardId);
        const rowData = data.getObjectAt(rowIndex);
        const columnKeys = this.getSomeColumnKeys();
        const planDateColumnKey = columnKeys.planDateColumnKey;
        const actualDateColumnKey = columnKeys.actualDateColumnKey;
        const isFinishedColumnKey = columnKeys.isFinishedColumnKey;
        const statusColumnKey = columnKeys.statusColumnKey;
        const actualDateValue = rowData[actualDateColumnKey] && rowData[actualDateColumnKey].value;
        // const planDateValue   = rowData[planDateColumnKey] && rowData[planDateColumnKey].value;
        const dateArray = actualDateValue?actualDateValue.split(this.proptypes.START_SPLIT_END):[];
        let start = dateArray[0]?dateArray[0]:"", end = dateArray[1]?dateArray[1]:"";
        const startDateTimeValue = start.split(this.proptypes.DATE_TIME_DELIMIT);
        let startTimeValue = startDateTimeValue.length == 2 ? startDateTimeValue[1] : '';
        //已开始
        if(isStarted){
            
            const now = moment().format(this.proptypes.FORMATSTR);
            const newStateDate = now+this.proptypes.DATE_TIME_DELIMIT+startTimeValue
            newStartDateValue = newStateDate+this.proptypes.START_SPLIT_END+end;
            data._dataset.setCellValue(rowData[statusColumnKey], TaskStatus.STARTED_STATUS)
        
            //状态视图
          if(!modalType){
            if(TaskViewList.View_Status === bv.viewId * 1){
              moveType = CHANGE_STATUS.sub_item_2.key;
              this.changeRowsGroup(moveType);
            //到期情况视图    
            }else{
              this.maturityViewChangeGroupRows();
            }
          }
        //未开始   
        }else{
            newStartDateValue = this.proptypes.DATE_TIME_DELIMIT+this.proptypes.START_SPLIT_END+this.proptypes.DATE_TIME_DELIMIT;
            data._dataset.setCellValue(rowData[isFinishedColumnKey],"false")
            data._dataset.setCellValue(rowData[statusColumnKey], TaskStatus.NOT_STARTED_STATUS);
            //状态视图
            if(!modalType){
              if(TaskViewList.View_Status === bv.viewId * 1){
                moveType = CHANGE_STATUS.sub_item_1.key;
                this.changeRowsGroup(moveType);
              //到期情况视图  
              }else{
                this.maturityViewChangeGroupRows();
              }
            }
        } 
        data._dataset.setCellValue(rowData[actualDateColumnKey],newStartDateValue);
        
    };

    changeStatusRelation = (targetStatus) => {
        const {data, rowIndex} = this.props;
        const bv = parseBoardViewId(data._boardId);
        const relationColumns = this.getSomeColumnKeys();
        const rowData = data.getObjectAt(rowIndex);
        const isStartedColumnKey  = relationColumns.isStartedColumnKey;
        const isFinishedColumnKey = relationColumns.isFinishedColumnKey;
        const statusColumnKey     = relationColumns.statusColumnKey;
        const isStartedColumnValue  = rowData[isStartedColumnKey] && rowData[isStartedColumnKey].value||"false";
        const isFinishedColumnValue = rowData[isFinishedColumnKey] && rowData[isFinishedColumnKey].value||"false";
        const statusColumnValue     = rowData[statusColumnKey] && rowData[statusColumnKey].value;
        let rowStatus;
        //已取消
        if(statusColumnValue === String(TaskStatus.CANCEL_STATUS)){
          rowStatus = TaskStatusRank.STATUS_CANCEL_RANK;
        //未开始  
        }else if((!isStartedColumnValue||isStartedColumnValue==="false")&&(!isFinishedColumnValue||isFinishedColumnValue==="false")){
          rowStatus = TaskStatusRank.STATUS_NOT_STARTED_RANK;
        //进行中
        }else if((isStartedColumnValue)&&(!isFinishedColumnValue||isFinishedColumnValue==="false")){
          rowStatus = TaskStatusRank.STATUS_STARTED_RANK;
        //已完成
        }else if((isStartedColumnValue)&&(isFinishedColumnValue)){
          rowStatus = TaskStatusRank.STATUS_FINISHED_RANK;
        }
        switch(rowStatus){

          case TaskStatusRank.STATUS_NOT_STARTED_RANK://未开始
            //进行中
            if(targetStatus === CHANGE_STATUS.sub_item_2.key){
              data.setObjectAt(rowIndex,relationColumns.isStartedColumnKey,true);
              this.relationIsStartUpdateActualDate(true);
            //完成
            }else if(targetStatus === CHANGE_STATUS.sub_item_3.key){
              data.setObjectAt(rowIndex,relationColumns.isFinishedColumnKey,true);
              this.relationUpdateActualDate("true");
            //取消
            }else if(targetStatus === CHANGE_STATUS.sub_item_4.key){
              data.setObjectAt(rowIndex,relationColumns.statusColumnKey,TaskStatus.CANCEL_STATUS);
              //状态视图
              if(TaskViewList.View_Status === bv.viewId * 1){
                this.changeRowsGroup(targetStatus);
              //到期情况视图  
              }else{
                this.maturityViewChangeGroupRows();
              }
            }
          break;

          case TaskStatusRank.STATUS_STARTED_RANK://进行中
            //未开始
            if(targetStatus === CHANGE_STATUS.sub_item_1.key){
              data.setObjectAt(rowIndex,relationColumns.isStartedColumnKey,false);
              this.relationIsStartUpdateActualDate(false);
            //完成
            }else if(targetStatus === CHANGE_STATUS.sub_item_3.key){
              data.setObjectAt(rowIndex,relationColumns.isFinishedColumnKey,true);
              this.relationUpdateActualDate("true");
            //取消
            }else if(targetStatus === CHANGE_STATUS.sub_item_4.key){
              data.setObjectAt(rowIndex,relationColumns.statusColumnKey,TaskStatus.CANCEL_STATUS);
              //状态视图
              if(TaskViewList.View_Status === bv.viewId * 1){
                this.changeRowsGroup(targetStatus);
              //到期情况视图  
              }else{
                this.maturityViewChangeGroupRows();
              }
            }
          break;

          case TaskStatusRank.STATUS_FINISHED_RANK://"已完成"
            //未开始
            if(targetStatus === CHANGE_STATUS.sub_item_1.key){
              data.setObjectAt(rowIndex,relationColumns.isStartedColumnKey,false);
              this.relationIsStartUpdateActualDate(false);
            //进行中
            }else if(targetStatus === CHANGE_STATUS.sub_item_2.key){
              data.setObjectAt(rowIndex,relationColumns.isFinishedColumnKey,false);
              this.relationIsStartUpdateActualDate(true);
            //取消    
            }else if(targetStatus === CHANGE_STATUS.sub_item_4.key){
              data.setObjectAt(rowIndex,relationColumns.statusColumnKey,TaskStatus.CANCEL_STATUS);
              //状态视图
              if(TaskViewList.View_Status === bv.viewId * 1){
                this.changeRowsGroup(targetStatus);
              //到期情况视图  
              }else{
                this.maturityViewChangeGroupRows();
              }
            }
          break;

          case TaskStatusRank.STATUS_CANCEL_RANK://"已取消"
            //未开始
            if(targetStatus === CHANGE_STATUS.sub_item_1.key){
              data.setObjectAt(rowIndex,relationColumns.statusColumnKey,TaskStatus.NOT_STARTED_STATUS);
            //进行中
            }else if(targetStatus === CHANGE_STATUS.sub_item_2.key){
              data.setObjectAt(rowIndex,relationColumns.statusColumnKey,TaskStatus.STARTED_STATUS);
            //已完成  
            }else if(targetStatus === CHANGE_STATUS.sub_item_3.key){
              data.setObjectAt(rowIndex,relationColumns.statusColumnKey,TaskStatus.CLOSED_STATUS);
            }
            //状态视图
            if(TaskViewList.View_Status === bv.viewId * 1){
              this.changeRowsGroup(targetStatus);
            //到期情况视图  
            }else{
              this.maturityViewChangeGroupRows();
            }
          break;

        }
      };

    /*
    *  @函数描述：状态视图分区数据移动修改
    *  @函数参数：移动类型=>移动到：进行中/未开始/已完成/已取消
    */
    changeRowsGroup = (moveType) => {
        const {rowIndex, data} = this.props;
        let allGroups = data.getGroups();
        let rowKey = data.getRowKey(rowIndex);
        let curGroup = this.getCurrGroupByRowKey(rowKey);
        let rowObj = curGroup.rows.find((r) => r.id === rowKey);
        let targetGroup;
        //移动至进行中/未开始/已完成/已取消
        switch(moveType){
            case CHANGE_STATUS.sub_item_4.key:
                targetGroup = allGroups.find((g) => g.rank === TaskStatusRank.STATUS_CANCEL_RANK);
                break; 

            case CHANGE_STATUS.sub_item_3.key:
                targetGroup = allGroups.find((g) => g.rank === TaskStatusRank.STATUS_FINISHED_RANK);
                break;

            case CHANGE_STATUS.sub_item_2.key:
                targetGroup = allGroups.find((g) => g.rank === TaskStatusRank.STATUS_STARTED_RANK);
                break;

            case CHANGE_STATUS.sub_item_1.key:
                targetGroup = allGroups.find((g) => g.rank === TaskStatusRank.STATUS_NOT_STARTED_RANK);
                break;
        }
        
        curGroup.rows = curGroup.rows.filter((row) => row.id !== rowKey);
        curGroup.totalRows--;
        if(targetGroup && Array.isArray(targetGroup.rows)){
          targetGroup.rows.push(rowObj);
          targetGroup.totalRows++;
        }
        data._dataset.runCallbacks(data._boardId);
    };

    /*
    *  @函数描述：时间视图数据修改联动及分区数据移动修改
    *  @函数参数： 
    */
    maturityViewChangeGroupRows = () => {
      const {rowIndex, data} = this.props;
      const bv = parseBoardViewId(data._boardId);
      if(TaskViewList.View_Status === bv.viewId * 1){
        return;
      }
      let allGroups = data.getGroups();
      let rowKey = data.getRowKey(rowIndex);
      let curGroup = this.getCurrGroupByRowKey(rowKey);
      let rowObj = curGroup.rows.find((r) => r.id === rowKey);
      let targetGroup;

      const rowData = data.getObjectAt(rowIndex);
      const columnKeys = this.getSomeColumnKeys();
      const statusColumnKey = columnKeys.statusColumnKey;
      const isFinishedColumnKey  = columnKeys.isFinishedColumnKey;
      const planDateColumnKey   = columnKeys.planDateColumnKey;
      const actualDateColumnKey = columnKeys.actualDateColumnKey;
      const planDateValue   = rowData[planDateColumnKey] && rowData[planDateColumnKey].value||"";
      const actualDateValue = rowData[actualDateColumnKey] && rowData[actualDateColumnKey].value||"";
      const status = rowData[statusColumnKey] && rowData[statusColumnKey].value
      let isFinished = rowData[isFinishedColumnKey] && rowData[isFinishedColumnKey].value||"false";
      const actualDateArray = actualDateValue?actualDateValue.split(this.proptypes.START_SPLIT_END):[];
      let actualStart = actualDateArray[0]?actualDateArray[0]:"", actualEnd = actualDateArray[1]?actualDateArray[1]:"";
      const actualEndDateTimeValue = actualEnd.split(this.proptypes.DATE_TIME_DELIMIT);
      let actualendDate = actualEndDateTimeValue.length == 2 ? actualEndDateTimeValue[0] : '';

      const planDateArray = planDateValue?planDateValue.split(this.proptypes.START_SPLIT_END):[];
      let planStart = planDateArray[0]?planDateArray[0]:"", planEnd = planDateArray[1]?planDateArray[1]:"";
      const planEndDateTimeValue = planEnd.split(this.proptypes.DATE_TIME_DELIMIT);
      let planEndDate = planEndDateTimeValue.length == 2 ? planEndDateTimeValue[0] : '';

      const {isThisWeek,isNextWeek,isNextWeekAfter} = getDayIsThisOrNextWeek(planEndDate); 
      //无计划日期
      let noPlanEndDate = planEndDate===""?true:false;
      //是否逾期一周以上
      let delayOneWeek = moment().diff(moment(planEndDate),'days')>=7?true:false;
      //是否逾期一周以内
      let delayWithInOneWeek = (moment().diff(moment(planEndDate),'days')>0&&moment().diff(moment(planEndDate),'days')<7)?true:false;
      //今天到期
      let dueToday = moment(planEndDate).isSame(moment(),'date')?true:false;
      //明天到期
      let dueTomorrow = !moment(planEndDate).isSame(moment(),'date')&&moment(planEndDate).diff(moment(),'days')===0?true:false;
      //本周到期
      let thisWeek = (moment(planEndDate).diff(moment(),'days')>=1&&isThisWeek)?true:false;
      //下周到期
      let nextWeek = isNextWeek?true:false;
      //下周后到期
      let nextWeekAfter = isNextWeekAfter?true:false;
      //两周内已报完成
      let finishedTowWeeks = (actualendDate&&moment().diff(moment(actualendDate),'days')<14)?true:false;
      //两周之前完成
      let finishedTowWeeksAgo = (actualendDate&&moment().diff(moment(actualendDate),'days')>=14)?true:false;
      if(status === TaskStatus.CANCEL_STATUS){
        targetGroup = allGroups.find((g) => g.rank === TaskMaturityRank.CANCELED);
      }else{
          //未完成
          if(isFinished==="false"){
            if(noPlanEndDate){
              targetGroup = allGroups.find((g) => g.rank === TaskMaturityRank.NO_PLAN_DATE);
            }else if(delayOneWeek){
              targetGroup = allGroups.find((g) => g.rank === TaskMaturityRank.DELAY_MORE_THAN_ONE_WEEK_OVERDUE);
            }else if(delayWithInOneWeek){
              targetGroup = allGroups.find((g) => g.rank === TaskMaturityRank.DELAY_WITHIN_ONE_WEEK_OVERDUE); 
            }else if(dueToday){
              targetGroup = allGroups.find((g) => g.rank === TaskMaturityRank.DUE_TODAY);
            }else if(dueTomorrow){
              targetGroup = allGroups.find((g) => g.rank === TaskMaturityRank.DUE_TOMORROW);
            }else if(thisWeek){
              targetGroup = allGroups.find((g) => g.rank === TaskMaturityRank.DUE_THIS_WEEK);
            }else if(nextWeek){
              targetGroup = allGroups.find((g) => g.rank === TaskMaturityRank.DUE_NEXT_WEEK);
            }else if(nextWeekAfter){
              targetGroup = allGroups.find((g) => g.rank === TaskMaturityRank.DUE_NEXT_WEEK_AFTER);
            } 
          }else{
              if(finishedTowWeeks){
                targetGroup = allGroups.find((g) => g.rank === TaskMaturityRank.FINISHED_IN_TOW_WEEKS);
              }else if(finishedTowWeeksAgo){
                targetGroup = allGroups.find((g) => g.rank === TaskMaturityRank.FINISHED_TWO_WEEKS_AGO);
              }
          }
      }
      curGroup.rows = curGroup.rows.filter((row) => row.id !== rowKey);
      if(targetGroup && Array.isArray(targetGroup.rows)){
        targetGroup.rows.push(rowObj);
      }
      data._dataset.runCallbacks(data._boardId);
    };


    /*
    *  @函数描述：已取消状态恢复到原有状态分区
    *  @函数参数： 
    */
    unDoCancel = () => {
        const {data, rowIndex} = this.props;
        const bv = parseBoardViewId(data._boardId);
        const rowData = data.getObjectAt(rowIndex);
        const relationColumns  = this.getSomeColumnKeys();
        const isStartedColumnKey  = relationColumns.isStartedColumnKey;
        const isFinishedColumnKey = relationColumns.isFinishedColumnKey;
        const statusColumnKey     = relationColumns.statusColumnKey;
        let isStarted  = rowData[isStartedColumnKey] && rowData[isStartedColumnKey].value||"false";
        let isFinished = rowData[isFinishedColumnKey] && rowData[isFinishedColumnKey].value||"false";
        let moveType;
        //已完成
        if(isStarted === "true" && isFinished === "true"){
          data.setObjectAt(rowIndex,statusColumnKey,TaskStatus.CLOSED_STATUS);
          moveType = CHANGE_STATUS.sub_item_3.key;
        //进行中  
        }else if(isStarted === "true" && isFinished === "false"){
          data.setObjectAt(rowIndex,statusColumnKey,TaskStatus.STARTED_STATUS);
          moveType = CHANGE_STATUS.sub_item_2.key;
        //未开始  
        }else if(isStarted === "false" && isFinished === "false"){
          data.setObjectAt(rowIndex,statusColumnKey,TaskStatus.NOT_STARTED_STATUS);
          moveType = CHANGE_STATUS.sub_item_1.key;
        }
        //状态视图
        if(TaskViewList.View_Status === bv.viewId * 1){
          this.changeRowsGroup(moveType);
        //到期情况视图  
        }else{
          this.maturityViewChangeGroupRows();
        }
        
    };


    /*
    *  @函数描述：admin 直接切换状态列反向联动
    *  @函数参数： 
    */
    adminChangeStatus = (status) => {
      const {data, rowIndex} = this.props;
      const relationColumns = this.getSomeColumnKeys();
      const rowData = data.getObjectAt(rowIndex);
      const statusColumnKey = relationColumns.statusColumnKey;
      //当前状态
      const statusColumnValue =rowData[statusColumnKey] && rowData[statusColumnKey].value;
      switch(statusColumnValue*1){

        case TaskStatus.NOT_STARTED_STATUS://未开始
          //进行中
          if(status*1 === TaskStatus.STARTED_STATUS){
            data.setObjectAt(rowIndex,relationColumns.isStartedColumnKey,true);
            this.relationIsStartUpdateActualDate(true);
          //完成
          }else if(status*1 === TaskStatus.CLOSED_STATUS){
            data.setObjectAt(rowIndex,relationColumns.isFinishedColumnKey,true);
            this.relationUpdateActualDate("true");
          //取消
          }else if(status*1 === TaskStatus.CANCEL_STATUS){
            data.setObjectAt(rowIndex,relationColumns.statusColumnKey,TaskStatus.CANCEL_STATUS);
          }
        break;

        case TaskStatus.STARTED_STATUS://进行中
          //未开始
          if(status*1 === TaskStatus.NOT_STARTED_STATUS){
            data.setObjectAt(rowIndex,relationColumns.isStartedColumnKey,false);
            this.relationIsStartUpdateActualDate(false);
          //完成
          }else if(status*1 === TaskStatus.CLOSED_STATUS){
            data.setObjectAt(rowIndex,relationColumns.isFinishedColumnKey,true);
            this.relationUpdateActualDate("true");
          //取消
          }else if(status*1 === TaskStatus.CANCEL_STATUS){
            data.setObjectAt(rowIndex,relationColumns.statusColumnKey,TaskStatus.CANCEL_STATUS);
          }
        break;

        case TaskStatus.CLOSED_STATUS://"已完成"
          //未开始
          if(status*1 === TaskStatus.NOT_STARTED_STATUS){
            data.setObjectAt(rowIndex,relationColumns.isStartedColumnKey,false);
            this.relationIsStartUpdateActualDate(false);
          //进行中
          }else if(status*1 === TaskStatus.STARTED_STATUS){
            data.setObjectAt(rowIndex,relationColumns.isFinishedColumnKey,false);
            this.relationIsStartUpdateActualDate(true);
          //取消    
          }else if(status*1 === TaskStatus.CANCEL_STATUS){
            data.setObjectAt(rowIndex,relationColumns.statusColumnKey,TaskStatus.CANCEL_STATUS);
          }
        break;

        case TaskStatus.CANCEL_STATUS://"已取消"
          data.setObjectAt(rowIndex,relationColumns.statusColumnKey,status);
        break;

      }
    };

    /*
    *  @函数描述：根据rowKey找到原始group
    *  @函数参数：rowKey
    */
    getCurrGroupByRowKey = (rowKey) => {
      const {data} = this.props;
      let allGroups = data.getGroups();
      let thisGroup;
      allGroups.forEach(group => {
        const crrtGroup = group.rows.find((row) => row.id === rowKey);
        if(crrtGroup){
          thisGroup = group;
        }
      });
      return thisGroup;
    }

}

export {RelationCellToCell};

