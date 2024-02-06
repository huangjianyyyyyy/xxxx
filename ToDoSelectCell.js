import React, {  useState }  from "react";
import {
  Select,
  Tag,
  Avatar,
} from "antd";
import TooltipMsg from "../../../TooltipMsg";
import { ColumnType } from "../../../maintable/data/MainTableType";
const { Option } = Select;

const ToDoSelectCell = (props) => {
  const {  record ,columnsList ,isPushChangeDate,name,dataIndex,IsCellTip} = props;

  const [selectValue, setSelectValue] = useState(record[dataIndex] && record[dataIndex].srcColumnName);

  const statusColumn = columnsList.filter(
    (item) => item.columnComponentType === ColumnType.STATUS
  );

  const selectColumn = columnsList.filter(
    (item) => item.columnComponentType === ColumnType.SELECT
  );

  const peopleColumn = columnsList.filter(
    (item) =>
      item.columnComponentType === ColumnType.PEOPLESEARCHSINGLE ||
      item.columnComponentType === ColumnType.PEOPLESEARCH
  );

  const dateColumn = columnsList.filter(
    (item) => item.columnComponentType === ColumnType.DATE
  );

  const maxTagShow = (value) => {
    return (
      <Avatar.Group
        maxCount={1}
        size="small"
        maxStyle={{ color: "#f56a00", backgroundColor: "#fde3cf" }}
      >
        <Avatar size="small" gap={0} style={{ backgroundColor: "black" }}>
          {"+" + value.length}
        </Avatar>
      </Avatar.Group>
    );
  };

  const ColumnCellData = (value) => {
    let data;
    switch (value) {
      case TooltipMsg.Person_Liable:
      case TooltipMsg.Participants:
      case TooltipMsg.Proposer:
        data = peopleColumn.map((item) => <Option value={item.id}>{item.name}</Option>);
        break;
      case TooltipMsg.State:
        data = statusColumn.map((item) => <Option value={item.id}>{item.name}</Option>);
        break;
      case TooltipMsg.Planned_Start_Time:
      case TooltipMsg.Planned_End_Time:
        data = dateColumn.map((item) => <Option value={item.id}>{item.name}</Option>);
        break;
      case TooltipMsg.TaskType:
        data = selectColumn.map((item) => <Option value={item.id}>{item.name}</Option>);
      case TooltipMsg.Urgent:
        data = selectColumn.map((item) => <Option value={item.id}>{item.name}</Option>);
       break;
    }
    return data;
  };

  const todoTagRender = (props) => {
    const { label, closable, onClose } = props;
    return (
      <Tag color="blue" closable={closable} onClose={onClose}>
        {label}
      </Tag>
    );
  };

  const onStatusChange = (record, dataIndex, Option) => {
    record[dataIndex]["srcColumnID"] = Option && Option.value;
    record[dataIndex]["srcColumnName"] = Option && Option.children;
    setSelectValue(Option && Option.children);
    isPushChangeDate(record)
  };
  return (
    <Select
      value={selectValue}
      style={{ width: 150 }}
      bordered={false}
      maxTagTextLength={3}
      maxTagCount={1}
      todoTagRender={todoTagRender}
      onChange={(_, option) => onStatusChange(record, dataIndex, option)}
      allowClear
      maxTagPlaceholder={(value) => maxTagShow(value)}
      showArrow={true}
      showSearch={false}
      placeholder={
        IsCellTip &&
        (name === TooltipMsg.Person_Liable || name === TooltipMsg.State) &&
        TooltipMsg.Cannot_Be_Empty
      }
    >
      {ColumnCellData(name)}
    </Select>
  );
};
export default ToDoSelectCell;
