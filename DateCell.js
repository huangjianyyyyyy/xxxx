import React from 'react';
import 'antd/dist/antd.css';
import { Button, DatePicker, Switch, Row, Col, message, Input, TimePicker } from 'antd';
import moment from 'moment';
// import 'moment/locale/zh-cn';
import './DateCell.less';
import { DISPLAY, COLOR } from '../../section/header/StyleValues';
import Keys from '../../../maintable/vendor_upstream/core/Keys';
// import { getCellPopupHeight } from './CellProperties';
// import TooltipMsg from '../../../TooltipMsg';
import ErrorMsg from '../../../ErrorMsg';
import { TaskDateFormatStr } from '../taskcolumns/TaskColumns';
import { ColumnType,AlertType,ModalTypes} from '../../../maintable/data/MainTableType';
import { AlertIcon } from "../../../icons/FlagIcon";
import {
  ExclamationCircleFilled,
  CheckCircleFilled,
} from "@ant-design/icons";

const format = TaskDateFormatStr.DATE_FORMAT_STR;
const dateTimeFormat = TaskDateFormatStr.DATETIME_FORMAT_STR

class DateCell extends React.PureComponent {
  #date_time_delimit = ' ';

  constructor(props) {
    super(props);
    let value = props.value ? props.value : "";
    let dateTimeValue = this.formatRenderDateValue(value);

    this.state = {
      open: false,//输入框日期框切换
      dateTimeStr: value,//显示的时间
      dateValue: dateTimeValue['dateValue'],//控件的日期
      timeValue: dateTimeValue['timeValue'],//时间的选择
      switchChecked: false,//时间切换
      mouseIn:false,
      rowId:props.rowId,
    };
  }

  _onRef = (div) => {
    this.setState({ container: div });
  }

  //时间属性处理
  formatRenderDateValue = (value) => {
    let dateValue = "";
    let timeValue = "";

    if (value !== "") {
      const dateTimeValue = value.split(this.#date_time_delimit);
      dateValue = moment(dateTimeValue[0], format);
      timeValue = dateTimeValue.length == 2 ? dateTimeValue[1] : "";
    }

    return {
      dateValue: dateValue,
      timeValue: timeValue,
    };
  };
  // 增加点击文档事件
  handleAddEvent = () => {
    document.addEventListener('click', this.handleClick);
  };

  handleRemoveEvent = () => {
    // 移除点击的监听事件
    document.removeEventListener('click', this.handleClick);
  };

  componentWillUnmount() {
    this.handleRemoveEvent();
  }

  handleClick = (e) => {
    // 判断鼠标是否在日期选择框内
    if (!this.state.mouseIn) {
      this.closeDatePicker();
    }
  };

  //关闭日期控件
  closeDatePicker = () => {
    this.handleRemoveEvent();
    this.setState({
      open: false,
    });
    this.props.handleCellEditEnd();
  };
  
  doubleClickDate = (e) => {
    this.saveDateTime( this.state.dateValue, this.state.timeValue,e)

  }

  showDatePicker = (e) => {
    const {data,columnKey}=this.props;
    const column = data.getColumn(columnKey);
    if(this.props.isReadonly || column.agelilevel==900){
      return;
    }
    this.setState({
      open:true
    })
    // 无权限无法点击展开日期控件（阻止控件变色）
    this.props.handleCellEdit(ColumnType.DATE);
    document.addEventListener("click", this.handleClick,true);
  };
  //操作滑块
  switchAddTime = (checked) => {
    this.setState({
      switchChecked: checked,
      timeValue: "",
    });
  };
  //监听时间改变
  timeChange = (time, timeString) => {
    this.setState({
      timeValue: time,
    }, () => {
      this.setState({
        switchChecked: false,
      })
    })
  }
  //保存日期
  saveDateTime = (dateValue, timeValue,event) => {
    event.stopPropagation(); 
    let dateTimeStr;
    if (!dateValue && this.dateInputRef.state.value === "") {
      message.warning(ErrorMsg.date_is_empty);
      return;
    }
    this.setState({
      open: false,
    });
    this.handleRemoveEvent();
    let resetType = this.props.modaltype===ModalTypes.RESETDATE;
    if (dateValue) {
      if (this.dateInputRef.state.value === "" && this.state.dateTimeStr === "") {//没有值时初始判断输入
        if (this.state.switchChecked === false) {
            dateTimeStr = moment(dateValue).format(format) + (moment(timeValue).format('HH:mm') === "Invalid date" ? "" : moment(timeValue).format('HH:mm'));
            this.props.handleChange(dateTimeStr, true);
        } else if (this.state.switchChecked === true) {
            dateTimeStr = moment(dateValue).format(format) + this.#date_time_delimit + (moment(this.defaulTime).format('HH:mm') === "Invalid date" ? "" : moment(this.defaulTime).format('HH:mm'));
            this.props.handleChange(dateTimeStr, true);
        }

      } else if (this.dateInputRef.state.value !== "" && this.state.dateTimeStr !== "") {//已经有组件值了输入
        if (this.dateInputRef.state.value === this.state.dateTimeStr) {//保存原有值
          if (timeValue) {
            if (moment(this.defaulTime).format('HH:mm') === timeValue) {//默认时间和设置时间相等
              // console.log(moment(this.defaulTime).format('HH:mm') === timeValue)
          
                dateTimeStr = moment(dateValue).format(format) + this.#date_time_delimit + (moment(this.defaulTime).format('HH:mm') === "Invalid date" ? "" : moment(this.defaulTime).format('HH:mm'));
        
                this.props.handleChange(dateTimeStr, true,resetType);
         
            }
            if (moment(this.defaulTime).format('HH:mm') !== timeValue) {//默认时间和设置时间不相等
              // console.log(moment(this.defaulTime).format('HH:mm') === timeValue)
              if (timeValue === "") {
          
                  dateTimeStr = moment(dateValue).format(format) + this.#date_time_delimit + (moment(this.defaulTime).format('HH:mm') === "Invalid date" ? "" : moment(this.defaulTime).format('HH:mm'));
            
                  this.props.handleChange(dateTimeStr, true,resetType);
              
              }
              if (timeValue !== "") {
       
                  dateTimeStr = moment(dateValue).format(format) + this.#date_time_delimit + (moment(timeValue).format('HH:mm') === "Invalid date" ? "" : moment(timeValue).format('HH:mm'));
           
                  this.props.handleChange(dateTimeStr, true,resetType);
              
              }
              this.calculateDiff(dateTimeStr,this.state.dateTimeStr);
            }
          } else if (!timeValue) {
            if (this.state.switchChecked === true) {
              
                dateTimeStr = moment(dateValue).format(format) + this.#date_time_delimit + (moment(this.defaulTime).format('HH:mm') === "Invalid date" ? "" : moment(this.defaulTime).format('HH:mm'));
                this.props.handleChange(dateTimeStr, true,resetType);
         
            } else if (this.state.switchChecked === false) {
              this.setState({
                timeValue: ""
              })
              dateTimeStr = moment(dateValue).format(format);
              
              this.props.handleChange(dateTimeStr, true,resetType);
            }
            this.calculateDiff(dateTimeStr,this.state.dateTimeStr);
          }



        } else if (this.dateInputRef.state.value !== this.state.dateTimeStr) {//是否是手动的判断
          let dateResult = this.dateInputRef.state.value;
          if (dateResult.length <= 10) {
            if (moment(dateResult).format(format) === 'Invalid date') {
              message.warning('请输入正确输入日期格式')
              this.setState({
                dateTimeStr: "",
                dateValue: ""
              }, () => {
                this.props.handleChange(this.state.dateTimeStr, true);
              })
              return;
            }
            this.setState({
              dateTimeStr: moment(dateResult).format(format),
              dateValue: moment(dateResult, format).valueOf(),
              switchChecked: false
            }, () => {
              this.props.handleChange(this.state.dateTimeStr, true);
            })
          } else if (dateResult.length > 10) {
            if (moment(dateResult).format(format) === 'Invalid date') {
              message.warning('请输入正确输入日期格式')
              this.setState({
                dateTimeStr: "",
                dateValue: ""
              }, () => {
                this.props.handleChange(this.state.dateTimeStr, true);
              })
              return;
            }
            this.setState({
              dateTimeStr: moment(dateResult).format(dateTimeFormat),
              dateValue: moment(dateResult, format).valueOf(),
              switchChecked: false
            }, () => {
              this.props.handleChange(this.state.dateTimeStr, true);
            })
          }
        }
      }
    } else if (!dateValue) {//初始状态对手动输入进行判断
      let dateResult = this.dateInputRef.state.value;
      if (dateResult.length <= 10) {
        if (moment(dateResult).format(format) === 'Invalid date') {
          message.warning('请输入正确输入日期格式')
          this.setState({
            dateTimeStr: "",
            dateValue: ""
          }, () => {
            this.props.handleChange(this.state.dateTimeStr, true);
          })
          return;
        }
        this.setState({
          dateTimeStr: moment(dateResult).format(format),
          dateValue: moment(dateResult, format).valueOf(),
        }, () => {
          this.props.handleChange(this.state.dateTimeStr, true);
        })
      } else if (dateResult.length > 10) {
        if (moment(dateResult).format(format) === 'Invalid date') {
          message.warning('请输入正确输入日期格式')
          this.setState({
            dateTimeStr: "",
            dateValue: ""
          }, () => {
            this.props.handleChange(this.state.dateTimeStr, true);
          })
          return;
        }
        this.setState({
          dateTimeStr: moment(dateResult).format(dateTimeFormat),
          dateValue: moment(dateResult, format).valueOf(),
        }, () => {
          this.props.handleChange(this.state.dateTimeStr, true);
        })
      }

    }
  };
  //清除日期
  clearDateTime = (event) => {
    event.stopPropagation(); 
    this.setState({
      open: false,
      switchChecked: false,
      dateTimeStr: "",
    });
    // this.defaulTime = 1595952000000
    this.handleRemoveEvent();
    this.props.handleChange("", true);
  };
  calculateDiff =(newValue,oldValue)=>{
    const { modaltype, data, columnKey,rowId } = this.props;
    if(modaltype ===ModalTypes.RESETDATE){
      oldValue = moment(oldValue); 
      newValue = moment(newValue); 
      let diff = newValue.diff(oldValue, 'days');
      data.batchModifyDateValue(columnKey,rowId,diff)
    }
   
  }
  renderDatePicker = (dateValue, timeValue, defaulTime) => {
    const { switchChecked } = this.state;
    let selectStyle = switchChecked ? DISPLAY.BLOCK : DISPLAY.NONE;
    return (
      <div>
        <Row>
          <Col span={12}>
            Add time&nbsp;
              <Switch size="small" onChange={this.switchAddTime} checked={(timeValue ? !switchChecked : switchChecked) || (!timeValue ? switchChecked : !switchChecked)} />
          </Col>
          <Col span={12} style={{ paddingLeft: "8px" }}>
            <TimePicker
              autoFocus={true}
              size="small"
              format="HH:mm"
              disabled={(timeValue ? switchChecked : !switchChecked) || (!timeValue ? !switchChecked : switchChecked)}
              defaultValue={moment(moment(defaulTime).format('HH:mm'), 'HH:mm')}
              onChange={this.timeChange}
              format="HH:mm"
            />
          </Col>
        </Row>
        <Row style={{ paddingBottom: '5px' }}>
          <Col span={12}>
            <Button
              type="primary"
              shape="round"
              size="small"
              style={{ float: 'left' }}
              onClick={this.saveDateTime.bind(this, dateValue, timeValue)}
            >
              保存
            </Button>
          </Col>
          <Col span={12}>
            <Button size="small" shape="round" style={{ float: 'right' }} onClick={this.clearDateTime}>
              清除
            </Button>
          </Col>
        </Row>
      </div>
    );
  };
  //日期组件onChange事件
  handleDateChange = (m, v) => {
    this.setState({
      dateValue: m,
    });
  };

  //输入框
  //日期事件格式化
  dateInputValue = (e) => {
    let dateResult = e.target.value;
    if (dateResult.length <= 12) {
      this.setState({
        dateTimeStr: moment(dateResult).format(format),
        switchChecked: false
      })
    } else if (dateResult.length > 12) {
      this.setState({
        dateTimeStr: moment(dateResult).format(dateTimeFormat),
        switchChecked: true
      })
    }
  }
  //输入框回车存日期输入
  handleKey = (e) => {
    if (e.keyCode == Keys.RETURN) {
      if (this.state.dateTimeStr === "Invalid date") {
        this.setState({
          dateTimeStr: ""
        }, () => {
          this.props.handleChange(this.state.dateTimeStr, true);
          this.setState({
            open: false,
          })
        })
        message.warning('请输入正确输入日期格式')
      }
      this.props.handleChange(moment(e.target.value).format("YYYY/MM/DD"), true);
      this.setState({
        open: false,
        dateValue: moment(this.state.dateTimeStr, format).valueOf(),
      })
    }
  };
  handleMouseEnter = () => {
    this.setState({
      mouseIn: true,
    });
  };

  handleMouseLeave = () => {
    this.setState({
      mouseIn: false,
    });
  };
  // componentDidMount() {
  //   this.handleAddEvent()
  // }

  static getDerivedStateFromProps(nextProps, prevState) {
    let {rowIndex,value}=nextProps;  
    value = value ? value : "";
    if (value != prevState.dateTimeStr || rowIndex != prevState.rowIndex) {
      return {
        dateTimeStr: value,
        rowIndex: rowIndex,
      }
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    let value = this.state.dateTimeStr
    if (prevState.dateTimeStr !== value) {
      let dateTimeValue = this.formatRenderDateValue(value);
      this.setState({
        dateValue: dateTimeValue['dateValue'],
        timeValue: dateTimeValue['timeValue'],
      })
    }
  }

  render() { 
    const { cellClassName, data, columnKey, alertType ,rowIndex} = this.props;
    const { dateValue, timeValue, dateTimeStr, open } = this.state;
    const columns = data.getColumns();
    let index = columns.findIndex((column) => column.columnKey === columnKey);
    let statusDate = false;
    let doneFlag = false;
    if(columns[index].agelilevel==900){
      statusDate=true;
      let statusColumn = columns[index-1];
      if(statusColumn && statusColumn.columnComponentType ==ColumnType.STATUS){
        let value =data.getObjectAt(rowIndex)[statusColumn.columnKey]?.value;
        let enumvalues = statusColumn.enumvalues;
        enumvalues && enumvalues.length>0 && enumvalues.map(item=>{
          if(item.id == value && item.doneFlag==1){
            doneFlag = true
          }
        })
      }
    }
    //对显示时间初始设置
    if (dateTimeStr !== "") {
      if (dateTimeStr.length === 17) {
        this.defaulTime = moment(dateTimeStr.split(" ")[1], 'HH:mm').valueOf();
      }
      if (dateTimeStr.length === 12) {
        this.defaulTime = 1595952000000;
      }
    } else if (dateTimeStr === "") {
      this.defaulTime = 1595952000000;
    }
    // console.log(dateValue + "----" + dateTimeStr + "====" + timeValue + "-----" + this.defaulTime)
    let defaultStyle = { textAlign: 'center', fontSize: 13, color: '#16191F', pointerEvents: 'none',display:'inline-block',height:'100%' };
    let inputClassName = 'date_display_input';
    if (cellClassName) {
      inputClassName = 'date_display_input date_display_select';
    }
    let filterStyle = {};
    if (this.props.filterInputValue) {
      let filterInputValue = this.props.filterInputValue.toLowerCase();
      if (dateTimeStr.toLowerCase().indexOf(filterInputValue) !== -1) {
        filterStyle = { backgroundColor: COLOR.CELL_FILTER_BG };
      }
    }
    const getAlertIcon = () => {
      if (alertType === AlertType.NORMAL)
        return <AlertIcon  style={{ fontSize: '16px', color: '#D13212', alignContent:"center" }} />;
      if (alertType === AlertType.WARNING)
        return <ExclamationCircleFilled style={{ fontSize: '16px', color: '#F1C330' , alignContent:"center" }} />;
      if (alertType === AlertType.DANGER) 
        return <ExclamationCircleFilled style={{ fontSize: '16px', color: 'red' , alignContent:"center" }} />;
      return null;
    };
    const getSuffix =(statusDate,doneFlag)=>{
      if(statusDate&&doneFlag ){
        return <CheckCircleFilled style={{color:'green'}}/>
      }
      return null
    }
    return (
      <div
        className="date_div"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        // onMouseDown={this.showDatePicker}
        style={filterStyle}
        onClick={this.showDatePicker.bind(this)}
        ref={this._onRef}
      >
            {open&&<div onDoubleClick={this.doubleClickDate.bind(this)}>
              <DatePicker
                className="Date_Cell date_picker_input"
                popupStyle={{ pointerEvents: 'visible' }}
                allowClear={false}
                bordered={false}
                placeholder=""
                open={open}
                suffixIcon={null}
                size="small"
                renderExtraFooter={this.renderDatePicker.bind(this, dateValue, timeValue, this.defaulTime)}
                value={
                  dateValue === "" ? dateValue : moment(moment(dateValue).format(format), format)
                }
                getPopupContainer={(trigger) =>
                  this.props.container
                    ? this.props.container
                    : trigger.parentElement
                }
                format={format}
                onChange={this.handleDateChange}
              />
               <Input ref={(ref) => { this.dateInputRef = ref }} onChange={this.dateInputValue} onKeyDown={this.handleKey} defaultValue={dateTimeStr} placeholder="YYYY/MM/DD HH:mm" />
            </div>}
            {
              !open&&<div className={inputClassName}>
                {!statusDate && getAlertIcon()}
                {statusDate && doneFlag && <CheckCircleFilled className='statusDate' />}
                <Input 
                  style={Object.assign({ border: 'none' }, defaultStyle, filterStyle)} 
                  readOnly 
                  value={dateTimeStr} 
                />
              
              </div>
            }

      </div>
    );
  }
}

export { DateCell };
