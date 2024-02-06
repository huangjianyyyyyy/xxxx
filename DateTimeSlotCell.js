import React from "react";
import "antd/dist/antd.css";
import {
  Button,
  DatePicker,
  Select,
  Switch,
  Row,
  Col,
  message,
  Input,
  Tooltip,
  Popover,
  Calendar
} from "antd";
import {
  ClockCircleOutlined,
  CheckOutlined,
  ExclamationOutlined,
} from "@ant-design/icons";
import moment from "moment";
// import 'moment/locale/zh-cn';
import "./DateTimeSlotCell.less";
import { DISPLAY, COLOR } from "../../section/header/StyleValues";
// import { getCellSelectedStyle } from './CellProperties';
import { RelationCellToCell } from "./RelationCellToCell";
import { ColumnType } from "../../../maintable/data/MainTableType";
import {
  TaskColumns,
  TaskDateFormatStr,
  TaskDateTimeSlotColor,
} from "../taskcolumns/TaskColumns";
import ErrorMsg from "../../../ErrorMsg";
import { withTranslation } from "react-i18next";

const format = TaskDateFormatStr.DATE_FORMAT_STR,
  defaultCellBGcolor = TaskDateTimeSlotColor.COLOR_DEFAULT,
  warningBGRedColor = TaskDateTimeSlotColor.COLOR_WARNING,
  delayBGYellowColor = TaskDateTimeSlotColor.COLOR_DELAY,
  finshedGreenBGColor = TaskDateTimeSlotColor.COLOR_FINISHED;

@withTranslation()
class DateTimeSlotCell extends React.PureComponent {
  #date_time_delimit = " ";
  #start_split_end = "TO";

  constructor(props) {
    super(props);
    const { t } = props;
    this.startSpanText = t("ColumnCell.DateTimeSlotCell.start_date");
    this.endSpanText = t("ColumnCell.DateTimeSlotCell.end_date");
    let value = props.value ? props.value : "";
    let dateTimeValue = this.formatRenderDateValue(value);
    let styleObject = this.checkStartDateAndEndDate(
      dateTimeValue.startDateValue,
      dateTimeValue.endDateValue
    );
    this.state = {
      //设置开始日期不可选区间（开始日期控件不可选日期区间>=结束日期）
      startDisabledDate: (date) => {
        if (dateTimeValue.endDateValue != "") {
          return date >= dateTimeValue.endDateValue.endOf("day");
        } else {
          return "";
        }
      },
      //设置结束日期不可选区间（结束日期控件不可选日期区间<=开始日期）
      endDisabledDate: (date) => {
        if (dateTimeValue.startDateValue != "") {
          return date < dateTimeValue.startDateValue.startOf("day");
        } else {
          return "";
        }
      },
      //日期列不同背景色
      cellBackgroundColor: defaultCellBGcolor,
      startDateOpen: false,
      endDateOpen: false,
      addTimeStyle: {
        display: DISPLAY.NONE,
      },
      styleObject: {
        width: styleObject.width,
        borderRadius: styleObject.borderRadius,
      },
      warningLeftStyleObject: {
        background: styleObject.warningBGColor,
        width: styleObject.warningWidth,
        borderRadius: styleObject.warningBorderRadius,
      },
      warningRightStyleObject: {
        width: styleObject.warningOtherWidth,
        borderRadius: styleObject.warningRightBorderRadius,
      },
      isNotStartAndWarning: styleObject.isNotStartAndWarning,
      isWarningDateSlot: styleObject.isWarningDateSlot,
      dateTootipText: styleObject.warningText,
      warningIcon: styleObject.warningIcon,
      warningDivZindex: 1,
      //给对应变量赋予后端传入的解析值
      startDateTimeStr:
        dateTimeValue.startDateTimeStr.trim() != ""
          ? dateTimeValue.startDateTimeStr
          : this.startSpanText,
      endDateTimeStr: dateTimeValue.endDateTimeStr
        ? dateTimeValue.endDateTimeStr.trim() != ""
          ? dateTimeValue.endDateTimeStr
          : this.endSpanText
        : this.endSpanText,
      startDateValue: dateTimeValue.startDateValue,
      endDateValue: dateTimeValue.endDateValue,
      startTimeValue: dateTimeValue.startTimeValue,
      endTimeValue: dateTimeValue.endTimeValue,
      startSwitchChecked: dateTimeValue.startTimeValue ? true : false,
      endSwitchChecked: dateTimeValue.endTimeValue ? true : false,
      container: null,
    };
  }

  getColumnKeyByType = () => {
    const { columnKey } = this.props;
    let isPlanDate = false;
    let isActualDate = false;
    let isCommDate = false;
    //计划时间段
    if (columnKey === String(TaskColumns.Column_Scheduled_TimeSlot)) {
      isPlanDate = true;
      isActualDate = false;
      isCommDate = false;
      //实际时间段
    } else if (columnKey === String(TaskColumns.Column_Real_TimeSlot)) {
      isPlanDate = false;
      isActualDate = true;
      isCommDate = false;
      //通用时间段
    } else {
      isPlanDate = false;
      isActualDate = false;
      isCommDate = true;
    }
    return {
      isPlanDate,
      isActualDate,
      isCommDate,
    };
  };

  // handleAddEvent = () => {
  //   // 增加点击事件
  //   document.addEventListener('click', this.handleClick);
  // };

  handleRemoveEvent = () => {
    // 移除点击的监听事件
    document.removeEventListener("click", this.handleClick);
  };

  handleClick = (e) => {
    // 判断鼠标是否在日期选择框内
    if (!this.state.mouseIn) {
      this.closeDatePicker();
    }
  };

  componentWillUnmount() {
    this.handleRemoveEvent();
  }

  // 更换生命周期
  componentDidUpdate(prevProps, prevState) {
    let  {rowIndex,value}=this.props;  
    value = value ? value : "";
    // 行ID变化或值变化则更新
    if (prevState.rowIndex != rowIndex || prevState.value != value) {
      // 同步数据
      this.syncDateData(value);
    }
  }

  // 同步更新数据
  syncDateData = (value) => {
    let dateTimeValue = this.formatRenderDateValue(value);
    let styleObject = this.checkStartDateAndEndDate(
      dateTimeValue.startDateValue,
      dateTimeValue.endDateValue
    );
    this.setState({
      rowId:this.props.rowId,
      value:value,
      rowIndex: this.props.rowIndex,
      startDateTimeStr:
        dateTimeValue.startDateTimeStr.trim() != ""
          ? dateTimeValue.startDateTimeStr
          : this.startSpanText,
      endDateTimeStr: dateTimeValue.endDateTimeStr
        ? dateTimeValue.endDateTimeStr.trim() != ""
          ? dateTimeValue.endDateTimeStr
          : this.endSpanText
        : this.endSpanText,
      startDateValue: dateTimeValue.startDateValue,
      endDateValue: dateTimeValue.endDateValue,
      startTimeValue: dateTimeValue.startTimeValue,
      endTimeValue: dateTimeValue.endTimeValue,
      styleObject: {
        width: styleObject.width,
        borderRadius: styleObject.borderRadius,
      },
      warningLeftStyleObject: {
        background: styleObject.warningBGColor,
        width: styleObject.warningWidth,
        borderRadius: styleObject.warningBorderRadius,
      },
      warningRightStyleObject: {
        width: styleObject.warningOtherWidth,
        borderRadius: styleObject.warningRightBorderRadius,
      },
      isNotStartAndWarning: styleObject.isNotStartAndWarning,
      isWarningDateSlot: styleObject.isWarningDateSlot,
      warningIcon: styleObject.warningIcon,
      dateTootipText: styleObject.warningText,
      //更新开始日期不可选区间
      startDisabledDate: (date) => {
        if (dateTimeValue.endDateValue != "") {
          return date >= dateTimeValue.endDateValue.endOf("day");
        } else {
          return "";
        }
      },
      //更新结束日期不可选区间
      endDisabledDate: (date) => {
        if (dateTimeValue.startDateValue != "") {
          return date < dateTimeValue.startDateValue.startOf("day");
        } else {
          return "";
        }
      },
    });
  };

  //拿到cell后端传入的原始值进行解析
  formatRenderDateValue = (value) => {
    let start = "",
      end = "",
      startDateValue = "",
      endDateValue = "",
      startTimeValue = "",
      endTimeValue = "";
    if (value !== "") {
      const dateArray = value.split(this.#start_split_end);
      start = dateArray[0];
      end = dateArray[1];

      const startDateTimeValue = start.split(this.#date_time_delimit);
      startDateValue =
        startDateTimeValue[0] != ""
          ? moment(startDateTimeValue[0], format)
          : "";
      startTimeValue =
        startDateTimeValue.length == 2 ? startDateTimeValue[1] : "";

      if (end !== undefined) {
        const endDateTimeValue = end.split(this.#date_time_delimit);
        endDateValue =
          endDateTimeValue[0] != "" ? moment(endDateTimeValue[0], format) : "";
        endTimeValue = endDateTimeValue.length == 2 ? endDateTimeValue[1] : "";
      } else {
        endDateValue = "";
        endTimeValue = "";
      }
    }
    return {
      startDateValue: startDateValue,
      endDateValue: endDateValue,
      startTimeValue: startTimeValue,
      endTimeValue: endTimeValue,
      startDateTimeStr: start,
      endDateTimeStr: end,
    };
  };

  checkStartDateAndEndDate = (start, end) => {
    //创建界面无rowIndex
    const { rowIndex, data } = this.props;
    if (rowIndex) {
      const rowData = data.getObjectAt(rowIndex);
      const { isPlanDate } = this.getColumnKeyByType();
      if (isPlanDate && rowData) {
        return this.checkPlanStartDateAndEndDate(start, end);
      } else {
        return this.checkActualStartDateAndEndDate(start, end);
      }
    } else {
      return this.checkActualStartDateAndEndDate(start, end);
    }
  };

  //实际时间:进度计算
  checkActualStartDateAndEndDate = (start, end) => {
    const dateFormat = TaskDateFormatStr.DATE_FORMAT_STR;
    let width = "100%",
      borderRadius = "30px",
      warningText = "";
    if (start !== "" && end !== "") {
      let isNowBetweenStartAndEnd = moment().isBetween(
        start.format(dateFormat),
        end.format(dateFormat)
      );
      let totalDiffDate = moment(end).diff(moment(start), "days");
      let startDiffDate = moment().diff(moment(start), "days");
      let endDiffDate = moment(end).diff(moment(), "days");
      if (isNowBetweenStartAndEnd) {
        width =
          Math.round(Number((startDiffDate / totalDiffDate).toFixed(2)) * 100) +
          "%";
        borderRadius = "30px 0 0 30px";
      } else {
        if (endDiffDate <= 0) {
          width = "100%";
        }
        if (startDiffDate <= 0) {
          width = 0;
        }
      }
    } else if (start === "" && end === "") {
      width = 0;
    } else {
      if (start === "" && end !== "") {
        let endDiffDate = moment(end).diff(moment(), "days");
        if (endDiffDate >= 0) {
          width = 0;
        } else {
          width = "100%";
        }
      } else if (start !== "" && end === "") {
        let startDiffDate = moment().diff(moment(start), "days");
        if (startDiffDate > 0) {
          width = "100%";
        } else {
          width = 0;
        }
      }
    }
    return {
      width: width,
      warningText: warningText,
      borderRadius: borderRadius,
    };
  };

  //计划时间:进度计算,预警
  checkPlanStartDateAndEndDate = (start, end) => {
    const { t } = this.props;
    const dateFormat = TaskDateFormatStr.DATE_FORMAT_STR;
    let width = "100%",
      borderRadius = "30px",
      isWarningDateSlot = false,
      warningWidth = 0,
      warningOtherWidth = 0,
      warningBorderRadius = "30px",
      warningRightBorderRadius = "0 30px 30px 0",
      warningText = "",
      warningBGColor = "",
      warningIcon = "",
      isNotStartAndWarning = false;
    const { rowIndex, data } = this.props;
    const relationCellToCell = new RelationCellToCell(this.props);
    const rowData = data.getObjectAt(rowIndex);
    const columnKeys = relationCellToCell.getSomeColumnKeys();
    const isFinishedColumnValue = rowData[columnKeys.isFinishedColumnKey]?rowData[columnKeys.isFinishedColumnKey].value:null;
    const isStartedColumnValue = rowData[columnKeys.isStartedColumnKey]?rowData[columnKeys.isStartedColumnKey].value:null;
    const actualDateColumnValue = rowData[columnKeys.actualDateColumnKey]?rowData[columnKeys.actualDateColumnKey].value:null;
    let isFinished = false,
      isStarted = false;
    isFinished =
      !isFinishedColumnValue || isFinishedColumnValue === "false"
        ? false
        : true;
    isStarted =
      !isStartedColumnValue || isStartedColumnValue === "false" ? false : true;
    if (start !== "" && end !== "") {
      let isNowBetweenStartAndEnd = moment().isBetween(
        start.format(dateFormat),
        end.format(dateFormat)
      );
      let totalDiffDate = moment(end).diff(moment(start), "days");
      let startDiffDate = moment().diff(moment(start), "days");
      let endDiffDate = moment(end).diff(moment(), "days");
      //有开始和结束时间，并且今天在开始和结束之间
      if (isNowBetweenStartAndEnd) {
        let widthNumber = Math.round(
          Number((startDiffDate / totalDiffDate).toFixed(2)) * 100
        );
        width = widthNumber + "%";
        warningOtherWidth = 100 - widthNumber + "%";
        borderRadius = "30px 0 0 30px";
        //事项已过计划开始时间但未开始：黄色
        if (!isStarted) {
          isWarningDateSlot = true;
          isNotStartAndWarning = true;
          warningBGColor = delayBGYellowColor;
          warningWidth = width;
          warningBorderRadius = borderRadius;
          warningText =
            t("ColumnCell.DateTimeSlotCell.over_plan_date") +
            startDiffDate +
            t("ColumnCell.DateTimeSlotCell.day");
          warningIcon = <ExclamationOutlined />;
          if (startDiffDate == 0) {
            warningRightBorderRadius = "30px";
            warningText = "";
            warningIcon = "";
          }
        } else {
          //事项标记为已完成时
          if (isFinished) {
            isWarningDateSlot = true;
            warningBGColor = finshedGreenBGColor;
            warningWidth = "100%";
            warningOtherWidth = 0;
            warningBorderRadius = "30px";
            warningIcon = <CheckOutlined />;
          }
        }
      } else {
        //有开始和结束时间，今天在结束日之后
        if (endDiffDate <= 0) {
          width = "100%";
          warningOtherWidth = 0;
          //事项未标记为已完成时
          if (!isFinished) {
            //今天是计划结束时间：黄色
            if (endDiffDate === 0) {
              isWarningDateSlot = true;
              warningBGColor = delayBGYellowColor;
              warningWidth = width;
              warningBorderRadius = borderRadius;
              warningText = t(
                "ColumnCell.DateTimeSlotCell.today_is_plan_end_date"
              );
              warningIcon = <ExclamationOutlined />;
              //事项未标记为已完成时，今天已过计划结束时间：绿色
            } else {
              isWarningDateSlot = true;
              warningBGColor = warningBGRedColor;
              warningWidth = width;
              warningBorderRadius = borderRadius;
              warningText =
                t("ColumnCell.DateTimeSlotCell.delayd") +
                Math.abs(endDiffDate) +
                t("ColumnCell.DateTimeSlotCell.day");
              warningIcon = <ExclamationOutlined />;
            }
          } else {
            //实际完成时间 - 预计完成时间 = 逾期天数
            let actualEndDate = actualDateColumnValue
              .split(this.#start_split_end)[1]
              .split(this.#date_time_delimit)[0];
            let delayDiffDate = moment(actualEndDate, dateFormat).diff(
              moment(end),
              "days"
            );
            isWarningDateSlot = true;
            warningBGColor = finshedGreenBGColor;
            warningWidth = "100%";
            warningBorderRadius = "30px";
            warningText =
              t("ColumnCell.DateTimeSlotCell.delay") +
              Math.abs(delayDiffDate) +
              t("ColumnCell.DateTimeSlotCell.finished_day");
            warningIcon = <CheckOutlined />;
          }
        } else {
          //今天在开始日期前
          if (isFinished) {
            isWarningDateSlot = true;
            warningBGColor = finshedGreenBGColor;
            warningWidth = "100%";
            warningBorderRadius = "30px";
            warningIcon = <CheckOutlined />;
          }
        }
        //今天早于开始时间
        if (startDiffDate <= 0) {
          width = 0;
        }
      }
    } else if (start === "" && end === "") {
      //无计划时间，并且是完成状态，显示绿色完成
      width = 0;
      if (isFinished) {
        isWarningDateSlot = true;
        warningBGColor = finshedGreenBGColor;
        warningWidth = "100%";
        warningBorderRadius = "30px";
        warningIcon = <CheckOutlined />;
      }
    } else {
      //只有结束时间
      if (start === "" && end !== "") {
        //完成状态
        if (isFinished) {
          isWarningDateSlot = true;
          warningBGColor = finshedGreenBGColor;
          warningWidth = "100%";
          warningBorderRadius = "30px";
          warningIcon = <CheckOutlined />;
        } else {
          let endDiffDate = moment(end).diff(moment(), "days");
          if (endDiffDate >= 0) {
            width = 0;
            warningText =
              t("ColumnCell.DateTimeSlotCell.before_end_day") +
              Math.abs(endDiffDate + 1) +
              t("ColumnCell.DateTimeSlotCell.day");
          } else {
            //今天已过结束日期
            width = "100%";
            warningOtherWidth = 0;
            borderRadius = "30px";
            // if (!isFinished) { // 貌似永远是true
            isWarningDateSlot = true;
            warningBGColor = warningBGRedColor;
            warningWidth = width;
            warningBorderRadius = borderRadius;
            warningText =
              t("ColumnCell.DateTimeSlotCell.delayd") +
              Math.abs(endDiffDate) +
              t("ColumnCell.DateTimeSlotCell.day");
            warningIcon = <ExclamationOutlined />;
            // } else {
            //   warningText = '';
            //   isWarningDateSlot = true;
            //   warningBGColor = finshedGreenBGColor;
            //   warningWidth = width;
            //   warningBorderRadius = borderRadius;
            //   warningIcon = <CheckOutlined />;
            // }
          }
        }

        //只有开始时间
      } else if (start !== "" && end === "") {
        if (isFinished) {
          isWarningDateSlot = true;
          warningBGColor = finshedGreenBGColor;
          warningWidth = "100%";
          warningBorderRadius = "30px";
          warningIcon = <CheckOutlined />;
        } else {
          let startDiffDate = moment().diff(moment(start), "days");
          if (startDiffDate > 0) {
            width = "100%";
            warningOtherWidth = 0;
            if (!isStarted) {
              isWarningDateSlot = true;
              warningBGColor = delayBGYellowColor;
              warningWidth = width;
              warningBorderRadius = borderRadius;
              warningText =
                t("ColumnCell.DateTimeSlotCell.over_plan_start_date") +
                startDiffDate +
                t("ColumnCell.DateTimeSlotCell.day");
              warningIcon = <ExclamationOutlined />;
            } else {
              warningText =
                t("ColumnCell.DateTimeSlotCell.started") +
                Math.abs(startDiffDate) +
                t("ColumnCell.DateTimeSlotCell.day");
            }
          } else {
            width = 0;
            // warningText = "距离开始还有"+Math.abs(startDiffDate)+"天";
          }
        }
      }
    }
    return {
      width: width,
      warningOtherWidth: warningOtherWidth,
      borderRadius: borderRadius,
      warningBGColor: warningBGColor,
      warningWidth: warningWidth,
      warningBorderRadius: warningBorderRadius,
      warningRightBorderRadius: warningRightBorderRadius,
      warningText: warningText,
      warningIcon: warningIcon,
      isWarningDateSlot: isWarningDateSlot,
      isNotStartAndWarning: isNotStartAndWarning,
    };
  };

  fomartDateNoYear = (
    startDateValue,
    endDateValue,
    startDateTimeStr,
    endDateTimeStr
  ) => {
    let startDateTimeText = "",
      endDateTimeText = "";
    const todayYear = moment().get("year");
    const startDateYear =
      startDateValue && startDateValue != "" ? startDateValue.get("year") : "";
    const endDateYear =
      endDateValue && endDateValue != "" ? endDateValue.get("year") : "";
    //开始日期年份是否是当年并且输入框文本不是开始日期（Start）
    if (startDateYear !== "" && startDateTimeStr !== this.startSpanText) {
      let startDate = startDateTimeStr.split(this.#date_time_delimit)[0];
      if (startDateYear === todayYear) {
        startDateTimeText = startDate.substr(5);
      } else {
        startDateTimeText = startDate.substr(2);
      }
    } else {
      startDateTimeText = this.startSpanText;
    }
    //结束日期年份是否是当年并且输入框文本不是结束日期（End）
    if (endDateYear !== "" && endDateTimeStr !== this.endSpanText) {
      let endDate = endDateTimeStr.split(this.#date_time_delimit)[0];
      if (endDateYear === todayYear) {
        endDateTimeText = endDate.substr(5);
      } else {
        endDateTimeText = endDate.substr(2);
      }
    } else {
      endDateTimeText = this.endSpanText;
    }
    return {
      startDateTimeText: startDateTimeText,
      endDateTimeText: endDateTimeText,
    };
  };

  // 关闭日期弹窗
  closeDatePicker = () => {
    this.handleRemoveEvent();
    this.setState(
      {
        startDateOpen: false,
        endDateOpen: false,
      },
      () => {
        // 关闭弹窗后重置state里面的value
        this.syncDateData(this.props.value ? this.props.value : "");
      }
    );
    this.props.handleCellEditEnd();
  };

  showDatePicker = (type, e) => {
    if(this.props.isReadonly){
      return;
    }
    // setTimeout(()=> {
    //   let refs = this.props.container.getElementsByClassName("ant-picker-panel-container");
    //   let ref = refs[refs.length-1];
    //   if (ref){
    //     this.props.handleCellEdit("DATETIMESLOT",ref.offsetHeight);
    //   }
    // }, 500);
    // 无权限无法点击展开日期控件（阻止控件变色）
    let isOpen = this.props.handleCellEdit(ColumnType.DATESLOT);
    if (type === "start") {
      this.setState(
        {
          startDateOpen: isOpen,
          endDateOpen: false,
        },
        () => {
          document.addEventListener("click", this.handleClick);
        }
      );
    } else {
      this.setState(
        {
          startDateOpen: false,
          endDateOpen: isOpen,
        },
        () => {
          document.addEventListener("click", this.handleClick);
        }
      );
    }
  };

  switchAddTime = (type, checked) => {
    if (type === "start") {
      this.setState({
        startSwitchChecked: checked,
      });
    } else {
      this.setState({
        endSwitchChecked: checked,
      });
    }
  };

  checkedAddTime = (type, v, o) => {
    if (type === "start") {
      this.setState({
        startTimeValue: v,
        startDateOpen: true,
      });
    } else {
      this.setState({
        endTimeValue: v,
        endDateOpen: true,
      });
    }
  };

  getOptions(Option) {
    const options = [];
    for (let i = 0; i <= 24; i++) {
      let timeStr = String(i) + ":00";
      if (i < 10) {
        timeStr = "0" + String(i) + ":00";
      } else if (i === 24) {
        timeStr = String(23) + ":59";
      }

      options.push(
        <Option key={i} value={timeStr}>
          {timeStr}
        </Option>
      );
    }
    return options;
  }

  //日期保存
  saveDateTime = (dateValue, timeValue, type, event) => {
    event.stopPropagation();
    const relationCellToCell = new RelationCellToCell(this.props);
    const value = this.formatRenderDateValue(this.props.value || "");
    const { isCommDate, isPlanDate,isActualDate } = this.getColumnKeyByType();

    let fullDateValue = "";
    if (type === "start") {
      if (!this.state.startDateValue || this.state.startDateValue === "") {
        message.warning(ErrorMsg.date_is_empty);
        return;
      }
      let startDateValue =
        moment(this.state.startDateValue).format(format) +
        this.#date_time_delimit +
        this.state.startTimeValue;
      const OldEndDateValue =
        value.endDateValue != ""
          ? moment(value.endDateValue).format(format) +
            this.#date_time_delimit +
            value.endTimeValue
          : this.#date_time_delimit + value.endTimeValue;
      fullDateValue = startDateValue + this.#start_split_end + OldEndDateValue;
      //点击确定选则开始日期后，设置结束日期的可选区域
      this.setState({
        endDisabledDate: (date) =>
          date && moment(this.state.startDateValue).startOf("day") >= date,
      });
      this.props.handleChange(fullDateValue, true);
      if (this.props.rowIndex) {
        //公用时间段组件无需联动
        if (!isCommDate) {
          let type = (moment(new Date()).format(format)>=moment(this.state.startDateValue).format(format))?true:false;
          relationCellToCell.actualDatechangeStartStatus(type, isPlanDate);
        }
      }
    } else {
      if (!this.state.endDateValue || this.state.endDateValue === "") {
        message.warning(ErrorMsg.date_is_empty);
        return;
      }
      let endDateValue =
        moment(this.state.endDateValue).format(format) +
        this.#date_time_delimit +
        this.state.endTimeValue;
      const OldStartDateValue =
        value.startDateValue != ""
          ? moment(value.startDateValue).format(format) +
            this.#date_time_delimit +
            value.startTimeValue
          : this.#date_time_delimit + value.startTimeValue;
      fullDateValue = OldStartDateValue + this.#start_split_end + endDateValue;
      //点击确定结束日期后，设置开始日期控件的可选区域
      this.setState({
        startDisabledDate: (date) =>
          date && moment(this.state.endtDateValue).endOf("day") <= date,
      });
      this.props.handleChange(fullDateValue, true);
      if (this.props.rowIndex) {
        if (isPlanDate) {
          //计划结束时间修改判断逾期情况并联动分区
          relationCellToCell.maturityViewChangeGroupRows();
        }
      }
    }
    //关闭日期浮窗，设定对应背景色
    let styleObject = this.checkStartDateAndEndDate(
      this.state.startDateValue,
      this.state.endDateValue
    );
    this.setState({
      startDateOpen: false,
      endDateOpen: false,
      styleObject: {
        width: styleObject.width,
        borderRadius: styleObject.borderRadius,
      },
      warningLeftStyleObject: {
        background: styleObject.warningBGColor,
        width: styleObject.warningWidth,
        borderRadius: styleObject.warningBorderRadius,
      },
      warningRightStyleObject: {
        width: styleObject.warningOtherWidth,
        borderRadius: styleObject.warningRightBorderRadius,
      },
      isNotStartAndWarning: styleObject.isNotStartAndWarning,
      isWarningDateSlot: styleObject.isWarningDateSlot,
      warningIcon: styleObject.warningIcon,
      dateTootipText: styleObject.warningText,
    });
    this.handleRemoveEvent();
  };

  //清除日期
  clearDateTime = (type, event) => {
    event.stopPropagation();
    const { isCommDate, isPlanDate } = this.getColumnKeyByType();
    const relationCellToCell = new RelationCellToCell(this.props);
    let styleObject = {};
    if (type === "start") {
      let end =
        this.state.endDateValue != ""
          ? moment(this.state.endDateValue).format(format) +
            this.#date_time_delimit +
            this.state.endTimeValue
          : this.#date_time_delimit + this.state.endTimeValue;
      this.props.handleChange(this.#start_split_end + end, true);
      if (end.trim() === "") {
        this.setState({
          cellBackgroundColor: defaultCellBGcolor,
        });
      }
      this.setState({
        startDateOpen: false,
        startSwitchChecked: false,
        endDisabledDate: "",
      });
      styleObject = this.checkStartDateAndEndDate("", this.state.endDateValue);
      if (this.props.rowIndex) {
        //公用时间段组件无需联动
        if (!isCommDate) {
          relationCellToCell.actualDatechangeStartStatus(false, isPlanDate);
        }
      }
    } else {
      let start =
        this.state.startDateValue != ""
          ? moment(this.state.startDateValue).format(format) +
            this.#date_time_delimit +
            this.state.startTimeValue
          : this.#date_time_delimit + this.state.startTimeValue;
      this.props.handleChange(start + this.#start_split_end, true);
      if (start.trim() === "") {
        this.setState({
          cellBackgroundColor: defaultCellBGcolor,
        });
      }
      this.setState({
        endDateOpen: false,
        endSwitchChecked: false,
        startDisabledDate: "",
      });
      styleObject = this.checkStartDateAndEndDate(
        this.state.startDateValue,
        ""
      );
      if (this.props.rowIndex) {
        if (isPlanDate) {
          //计划结束时间修改判断逾期情况并联动分区
          relationCellToCell.maturityViewChangeGroupRows();
        }
      }
    }
    this.setState({
      styleObject: {
        width: styleObject.width,
        borderRadius: styleObject.borderRadius,
      },
      warningLeftStyleObject: {
        background: styleObject.warningBGColor,
        width: styleObject.warningWidth,
        borderRadius: styleObject.warningBorderRadius,
      },
      warningRightStyleObject: {
        width: styleObject.warningOtherWidth,
        borderRadius: styleObject.warningRightBorderRadius,
      },
      isNotStartAndWarning: styleObject.isNotStartAndWarning,
      isWarningDateSlot: styleObject.isWarningDateSlot,
      warningIcon: styleObject.warningIcon,
      dateTootipText: styleObject.warningText,
    });
    this.handleRemoveEvent();
  };

  handleDateChange = (type, m, v) => {
    if (type === "start") {
      this.setState({
        startDateValue: moment(v, format),
      });
    } else {
      this.setState({
        endDateValue: moment(v, format),
      });
    }
  };

  renderDatePicker = (dateValue, timeValue, type) => {
    const { t } = this.props;
    const { Option } = Select;
    let switchChecked =
      type === "start"
        ? this.state.startSwitchChecked
        : this.state.endSwitchChecked;
    let selectStyle = switchChecked ? DISPLAY.BLOCK : DISPLAY.NONE;

    return (
      <div style={{ marginTop: "5px" }}>
        <Row style={{ display: "none" }}>
          <Col span={12}>
            <div style={{ float: "left" }}>
              Add time&nbsp;
              <Switch
                size="small"
                onChange={this.switchAddTime.bind(this, type)}
                checked={switchChecked}
              />
            </div>
          </Col>
          <Col span={12}>
            <div className="timeSelect">
              <Select
                placeholder={t("ColumnCell.DateTimeSlotCell.select_date")}
                suffixIcon={<ClockCircleOutlined />}
                size="small"
                style={{ display: selectStyle, width: 90 }}
                onSelect={this.checkedAddTime.bind(this, type)}
                value={timeValue === "" ? undefined : timeValue}
              >
                {this.getOptions(Option)}
              </Select>
            </div>
          </Col>
        </Row>
        <Row style={{ paddingBottom: "5px" }}>
          <Col span={12}>
            <Button
              type="primary"
              shape="round"
              size="small"
              style={{ float: "left" }}
              onClick={(e) => this.saveDateTime(dateValue, timeValue, type, e)}
            >
              {t("ColumnCell.DateTimeSlotCell.save")}
            </Button>
          </Col>
          <Col span={12}>
            <Button
              size="small"
              shape="round"
              style={{ float: "right" }}
              onClick={(e) => this.clearDateTime(type, e)}
            >
              {t("ColumnCell.DateTimeSlotCell.clear")}
            </Button>
          </Col>
        </Row>
      </div>
    );
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

  // 日期输入框样式
  getInputStyle = () => {
    return {
      width: "0",
      textAlign: "center",
      fontSize: 13,
      // color: '#16191F',
      pointerEvents: "none",
      border: 'none'
    };
  };

  //计划时间段组件
  renderPlanDate = () => {
    // const { cellClassName } = this.props;
    const {
      startDateValue,
      startTimeValue,
      endDateValue,
      endTimeValue,
      startDateTimeStr,
      endDateTimeStr,
      startDateOpen,
      endDateOpen,
    } = this.state;
    const noYearDateText = this.fomartDateNoYear(
      startDateValue,
      endDateValue,
      startDateTimeStr,
      endDateTimeStr
    );
    const startDateTimeText = noYearDateText.startDateTimeText;
    const endDateTimeText = noYearDateText.endDateTimeText;
    let inputClassName = "date_display_input";
    let filterStyle = {};
    if (this.props.filterInputValue) {
      let filterInputValue = this.props.filterInputValue.toLowerCase();
      if (
        (startDateTimeStr + endDateTimeStr)
          .toLowerCase()
          .indexOf(filterInputValue) !== -1
      ) {
        filterStyle = { backgroundColor: COLOR.CELL_FILTER_BG };
      }
    }
    return (
      <div
        className="DateTimeSlotCell"
        style={filterStyle}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <Tooltip
          placement="top"
          title={this.state.dateTootipText}
          arrowPointAtCenter
        >
          <div>
            {this.state.isWarningDateSlot && (
              <div className="DateTimeSlotCell_Warper3" style={{ zIndex: 0 }}>
                <div
                  className="dateDiff left"
                  style={this.state.warningLeftStyleObject}
                ></div>
                <div
                  className="dateDiff right"
                  style={this.state.warningRightStyleObject}
                ></div>
              </div>
            )}

            {!this.state.isWarningDateSlot && (
              <div
                className="DateTimeSlotCell_Warper2"
                style={this.state.styleObject}
              ></div>
            )}

            <div
              className="DateTimeSlotCell_Warper"
              style={{
                background: this.state.isWarningDateSlot
                  ? "none"
                  : this.state.cellBackgroundColor,
              }}
            >
              <div
                className="date_field_div left"
                onClick={this.showDatePicker.bind(this, "start")}
              >
               
                {startDateOpen&&<DatePicker
                  className="date_picker_input"
                  dropdownClassName="custom_date_picker"
                  getPopupContainer={(trigger) =>
                    this.props.container
                      ? this.props.container
                      : trigger.parentElement
                  }
                  disabledDate={this.state.startDisabledDate}
                  popupStyle={{ pointerEvents: "visible"}}
                  allowClear={false}
                  bordered={false}
                  placeholder=""
                  open={startDateOpen}
                  suffixIcon={null}
                  size="small"
                  renderExtraFooter={this.renderDatePicker.bind(
                    this,
                    startDateValue,
                    startTimeValue,
                    "start"
                  )}
                  value={startDateValue}
                  format={format}
                  onChange={this.handleDateChange.bind(this, "start")}
                />}
                {!startDateOpen&&<div className={inputClassName + " start_date_left"}>
                  {this.state.warningIcon}&nbsp;{startDateTimeText}
                </div>}
                
              </div>
              <div className="date_field_split"> - </div>
              <div
                className="date_field_div right"
                onClick={this.showDatePicker.bind(this, "end")}
              >
                {endDateOpen&&<DatePicker
                  className="date_picker_input"
                  dropdownClassName="custom_date_picker"
                  disabledDate={this.state.endDisabledDate}
                  popupStyle={{ pointerEvents: "visible"}}
                  allowClear={false}
                  bordered={false}
                  placeholder=""
                  open={endDateOpen}
                  getPopupContainer={(trigger) =>
                    this.props.container
                      ? this.props.container
                      : trigger.parentElement
                  }
                  suffixIcon={null}
                  size="small"
                  renderExtraFooter={this.renderDatePicker.bind(
                    this,
                    endDateValue,
                    endTimeValue,
                    "end"
                  )}
                  value={endDateValue}
                  format={format}
                  onChange={this.handleDateChange.bind(this, "end")}
                />}
                {!endDateOpen&&<div className={inputClassName + " end_date_right"}>
                  {endDateTimeText}
                </div>}
              </div>
            </div>
          </div>
        </Tooltip>
      </div>
    );
  };

  //结束时间段组件或通用时间段组件
  renderActualDate = () => {
    const { isActualDate } = this.getColumnKeyByType();
    // const { cellClassName } = this.props;
    const {
      startDateValue,
      startTimeValue,
      endDateValue,
      endTimeValue,
      startDateTimeStr,
      endDateTimeStr,
      startDateOpen,
      endDateOpen,
    } = this.state;
    const noYearDateText = this.fomartDateNoYear(
      startDateValue,
      endDateValue,
      startDateTimeStr,
      endDateTimeStr
    );
    const startDateTimeText = noYearDateText.startDateTimeText;
    const endDateTimeText = noYearDateText.endDateTimeText;
    let inputClassName = "date_display_input";
    let filterStyle = {};
    if (this.props.filterInputValue) {
      let filterInputValue = this.props.filterInputValue.toLowerCase();
      if (
        (startDateTimeStr + endDateTimeStr)
          .toLowerCase()
          .indexOf(filterInputValue) !== -1
      ) {
        filterStyle = { backgroundColor: COLOR.CELL_FILTER_BG };
      }
    }
    return (
      <div
        className="DateTimeSlotCell"
        style={filterStyle}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <Tooltip
          placement="top"
          title={this.state.dateTootipText}
          arrowPointAtCenter
        >
          <div>
            <div
              className="DateTimeSlotCell_Warper2"
              style={this.state.styleObject}
            ></div>
            <div
              className="DateTimeSlotCell_Warper"
              style={{ background: this.state.cellBackgroundColor }}
            >
              <div
                className="date_field_div left"
                onClick={this.showDatePicker.bind(this, "start")}
              >
                {startDateOpen&&<DatePicker
                  className="date_picker_input"
                  dropdownClassName="custom_date_picker"
                  getPopupContainer={(trigger) =>
                    this.props.container
                      ? this.props.container
                      : trigger.parentElement
                  }
                  disabledDate={this.state.startDisabledDate}
                  popupStyle={{ pointerEvents: "visible"}}
                  allowClear={false}
                  bordered={false}
                  placeholder=""
                  open={startDateOpen}
                  suffixIcon={null}
                  size="small"
                  renderExtraFooter={this.renderDatePicker.bind(
                    this,
                    startDateValue,
                    startTimeValue,
                    "start"
                  )}
                  value={startDateValue}
                  format={format}
                  onChange={this.handleDateChange.bind(this, "start")}
                />}
                {!startDateOpen&&<div className={inputClassName + " start_date_left"}>
                  {this.state.warningIcon}&nbsp;{startDateTimeText}
                </div>}
              </div>
              <div className="date_field_split"> - </div>
              <div
                className="date_field_div right"
                //实际结束时间不允许修改,通用组件允许
                onClick={
                  isActualDate ? null : this.showDatePicker.bind(this, "end")
                }
              >
                {endDateOpen&&<DatePicker
                  className="date_picker_input"
                  dropdownClassName="custom_date_picker"
                  disabledDate={this.state.endDisabledDate}
                  popupStyle={{ pointerEvents: "visible"}}
                  allowClear={false}
                  bordered={false}
                  placeholder=""
                  open={endDateOpen}
                  getPopupContainer={(trigger) =>
                    this.props.container
                      ? this.props.container
                      : trigger.parentElement
                  }
                  suffixIcon={null}
                  size="small"
                  renderExtraFooter={this.renderDatePicker.bind(
                    this,
                    endDateValue,
                    endTimeValue,
                    "end"
                  )}
                  value={endDateValue}
                  format={format}
                  onChange={this.handleDateChange.bind(this, "end")}
                />}
                {!endDateOpen&&<div className={inputClassName + " end_date_right"}>
                  {endDateTimeText}
                </div>}
              </div>
            </div>
          </div>
        </Tooltip>
      </div>
    );
  };

  render() {
    const { isPlanDate } = this.getColumnKeyByType();
    if (isPlanDate) {
      return this.renderPlanDate();
    } else {
      return this.renderActualDate();
    }
  }
}

export { DateTimeSlotCell };
