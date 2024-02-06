import React, {Fragment, createRef} from 'react';
import './SummaryCell.less';
import {Popover, Radio, Tooltip} from 'antd';
import {DateCellSummaryRule} from './CellProperties';
import { withTranslation } from 'react-i18next';
import {getTodoBoardFlag} from '../taskcolumns/TaskColumns';

function getColumnComponentType  (props)  {
  const {data, columnKey} = props;
  const column = data.getColumn(columnKey);

  // 统计列（状态和日期）  && (column.columnComponentType === 'STATUS' || column.columnComponentType === 'DATE')
  if (column) {
    return column.columnComponentType;
  }

  return null;
};

@withTranslation()
class SummaryCell extends React.PureComponent {
 
  constructor(props) {
    super(props);
    this.state = {
      columnComponentType: getColumnComponentType(props),
      isChanged: false,
      columnData:props.data._dataset._columnData[props.data._boardId][props.columnKey],
      BoardStatusSummary:props.data.getBoardStatusSummary(props.columnKey)
    };

    this.popoverRef = createRef();
  }

  // (nextProps) {
  //   return {
  //     columnComponentType: this.getColumnComponentType(nextProps),
  //   };
  // }
  static getDerivedStateFromProps(nextProps, prevState) {
    let oldBoardStatusSummary = nextProps.data.getBoardStatusSummary(nextProps.columnKey)
    let columnComponentType=getColumnComponentType(nextProps);
    if(columnComponentType != prevState.columnComponentType || oldBoardStatusSummary!=prevState.BoardStatusSummary){
      return {
        columnComponentType: columnComponentType,
        BoardStatusSummary:oldBoardStatusSummary
      };
    }
    return null
  }

  

  changeGroupCollapseState = () => {
    const {data, rowIndex} = this.props;
    let group = data.getGroupByRowIndex(rowIndex, true);
    data.changeGroupCollapseState(group.groupKey);
  };

  handleVisibleChange = (visible) => {
    if (visible) {
      this.props.onCellEdit(this.props.rowIndex, this.props.columnKey);
    } else {
      this.props.onCellEditEnd(this.props.rowIndex, this.props.columnKey);
    }
  };

  handleRadioChange = (e) => {
    // this.popoverRef.current.state.visible = false;
    this.setState({
      isChanged: !this.state.isChanged,
    });

    let value = e.target.value;
    this.props.data.updateColumnBoardData(this.props.columnKey, {
      summaryRule: value,
    });
  };

  getSummaryCell = () => {
    const { t } = this.props;
    const {data, rowIndex, columnKey, container} = this.props;
    let board = data._dataset._workspace[data._boardId]
   
    const spanText = {
      startSpanText : t('ColumnCell.DateTimeSlotCell.start_date'),
      endSpanText   : t('ColumnCell.DateTimeSlotCell.end_date')
    };
    const dateText = {
      earliest_time_text : t('ColumnCell.DateCell.earliest_time'),
      Latest_time_text   : t('ColumnCell.DateCell.Latest_time')
    };
    let column = data.getColumn(columnKey);
    const group = data.getGroupByRowIndex(rowIndex);
    const groupRows = data._filterRowsMap.filter((row) => (row.groupKey === group.groupKey&&row.rowType === "ROW"));
    const border_style = {
      width: '100%',
      borderLeft: '3px solid ' + group.color,
    };
    const expand_style = {
      cursor: 'pointer',
      color: group.color,
    };
    const total_style = {
      color: 'black',
      right: '5px',
      position: 'absolute'
    };
    const title_style = {
      fontWeight: 'nomal',
    };
    const count_style = {
      color: '#cccccc',
      fontSize: '12px',
    };
    const summary_cell_background = {
      background: group.isCollapsed ? 'white' : '',
    };
    let summaryCell;
    switch (this.state.columnComponentType) {

      case 'CHECKBOX':
        let checkBoxSummaryObject = data.getCheckBoxSummary(rowIndex,columnKey);
        summaryCell = (
          <Fragment>
              <div className="summary_cell">
                <div className="checkBoxSummaryWarp">{checkBoxSummaryObject.checkBoxSummary}</div>
              </div>
          </Fragment>
        );
        break;
      case 'DATETIMESLOTMIRROR':
      case 'DATETIMESLOT':
        let mirror = this.state.columnComponentType =='DATETIMESLOTMIRROR'?true:false;
        let dateSlotSummary = data.getDateSlotSummary(rowIndex, columnKey,spanText,mirror);
        let slotDateStyle = {
          borderRadius:dateSlotSummary.borderRadius,
          width:dateSlotSummary.width
        }
        summaryCell = (
          <Fragment>
              <div className="summary_cell">
                  <div className="dateTimeSlotCell">
                    <div className="dateTimeSlotCell_Warper2" style={slotDateStyle}></div>
                    <div className="dateTimeSlotCell_Warper">
                      <div className="date_field_div no_pointer">
                        <div className="start_date_left">
                          {dateSlotSummary.startMinDate}
                        </div>
                    </div>
                    <div className="date_field_split">-</div>
                    <div className="date_field_div no_pointer">
                        <div className="end_date_right">
                          {dateSlotSummary.endMaxDate}
                        </div>
                      </div>
                    </div>
                </div>
              </div>
          </Fragment>
        );
        break;

      case 'STATUS':
        // 状态列
          
        // 获取每个状态占的百分比
        let statusPercent = data.getStatusSummary(rowIndex, columnKey);
        if (board && getTodoBoardFlag(board.boardType)) {
          summaryCell = <div className="default_summary_cell" style={summary_cell_background} />;
        }else{
          summaryCell = (
          <div className="summary_cell">
            {<div className="summary_cell_status_container">
              {statusPercent.map((status,index) => {
                const statusText = status.style.statusName;
                let tooltipText = statusText+" "+status.style.fraction+"   "+status.style.width;
                return <Tooltip key={index} placement="top" title={status.style.statusName ? tooltipText : null} arrowPointAtCenter>
                    <div key={status.style.background} className="status_summary" style={status.style} />
                  </Tooltip>;
              })}
            </div>}
          </div>
          )
        }
        
        break;

      case 'DATE':
        // 日期列

        // 获取最小和最大日期及相差天数
        let dateSummary = data.getDateSummary(rowIndex, columnKey, dateText);
        const radioStyle = {
          display: 'block',
          height: '30px',
          lineHeight: '30px',
        };

        summaryCell = (
          <Fragment>
            <Popover
              ref={this.popoverRef}
              placement="leftBottom"
              trigger="click"
              autoAdjustOverflow={false}
              getPopupContainer={(trigger) => this.props.container ? this.props.container : trigger.parentElement}
              onVisibleChange={this.handleVisibleChange}
              content={
                <Radio.Group
                  style={{marginLeft: 4, pointerEvents: 'visible'}}
                  onChange={this.handleRadioChange}
                  value={dateSummary.summaryRule}
                >
                  <Radio style={radioStyle} value={DateCellSummaryRule.EARLIEST.key}>
                    {t('ColumnCell.DateCell.earliest_time')}
                  </Radio>
                  <Radio style={radioStyle} value={DateCellSummaryRule.LATEST.key}>
                    {t('ColumnCell.DateCell.Latest_time')}
                  </Radio>
                </Radio.Group>
              }
            >
              <div className="summary_cell">
                <div className="summary_cell_date_container">
                  {/* {dateSummary.dateDiff ? (
                  <div
                    style={{
                      background: `linear-gradient(to right, ${color} ${dateSummary.datePercent}, rgb(28, 31, 59) ${dateSummary.datePercent})`,
                    }}
                  >
                    <span
                      className="summary_cell_date_container_span"
                      contents={dateSummary.dateText}
                      hovercontents={dateSummary.dateDiff}
                    />
                  </div>
                ) : (
                  <span className="summary_cell_date_container_span">{dateSummary.dateText}</span>
                )} */}
                  {dateSummary.dateText2 ? (
                    <Fragment>
                      <div className="summary_cell_date_container_rule">{dateSummary.dateText1}</div>
                      <div className="summary_cell_date_container_text">{dateSummary.dateText2}</div>
                    </Fragment>
                  ) : null}
                </div>
              </div>
            </Popover>
          </Fragment>
        );
        break;

      default:
        summaryCell = <div className="default_summary_cell" style={summary_cell_background} />;
        break;
    }
    if (column&&column.isTitle && group.isCollapsed) {
      summaryCell = (
        <div className="summary_cell" style={expand_style} onClick={this.changeGroupCollapseState}>
          <div className="summary_cell_status_container">
            <span className="summary_cell_section_title">{group.name}</span>
            <div style={total_style}>
              <span style={title_style}>{t('ColumnCell.SummaryCell.total_count_small')}：</span>
              <span style={count_style}>{t('ColumnCell.SummaryCell.total')}{groupRows.length}{t('ColumnCell.SummaryCell.item')}</span>
            </div>
          </div>
        </div>
      );
    } else if (column&&column.columntype === 'ROWSELECT' && group.isCollapsed) {
      summaryCell = (
        <div className="summary_cell" style={border_style} onClick={this.changeGroupCollapseState}>
          <div className="summary_cell_status_container">
            <svg width="7" height="10" viewBox="0 0 7 10" fill="none" className="summary_cell_section_expand">
              <path d="M0.15332 8.825L3.96999 5L0.15332 1.175L1.32832 0L6.32832 5L1.32832 10L0.15332 8.825Z" fill={group.color}/>
            </svg>
            {/* <RightOutlined style={expand_style} onClick={this.changeGroupCollapseState} /> */}
          </div>
        </div>
      );
    } else if (column&&column.columntype === 'ROWACTION') {
      summaryCell = <div className="default_summary_cell" />;
    }
    return summaryCell;
  };

  getBoardSummaryCell = () => {
    const { t } = this.props;
    const {data, rowIndex, columnKey, container} = this.props;
    let board = data._dataset._workspace[data._boardId]
    const spanText = {
      startSpanText : t('ColumnCell.DateTimeSlotCell.start_date'),
      endSpanText   : t('ColumnCell.DateTimeSlotCell.end_date')
    };
    const dateText = {
      earliest_time_text : t('ColumnCell.DateCell.earliest_time'),
      Latest_time_text   : t('ColumnCell.DateCell.Latest_time')
    };
    let column = data.getColumn(columnKey);  
    let allRows = data._filterRowsMap.filter((row) => row.rowType==="ROW");
    let total = allRows.length; 
    let summaryCell;
 
    if (!allRows || total<1) {
        return null;
    }
    
    
    const summary_cell_top_border = {
      borderTop:'1px solid #f1f3f5'
    };
    const total_style = {
      color: 'black',
      right: '5px',
      position: 'absolute'
    };
    const title_style = {
      fontWeight: 'nomal',
    };
    const count_style = {
      color: '#cccccc',
      fontSize: '12px',
    };
    const summary_cell_background = {
      background: '#fafafa',
      borderTop:'1px solid #f1f3f5'
    };

    switch (this.state.columnComponentType) {

      case 'CHECKBOX':
        let checkBoxSummaryObject = data.getBoardCheckBoxSummary(columnKey);
        summaryCell = (
          <Fragment>
              <div className="board_summary_cell">
                <div className="checkBoxSummaryWarp">{checkBoxSummaryObject.checkBoxSummary}</div>
              </div>
          </Fragment>
        );
        break;

      case 'DATETIMESLOTMIRROR':
      case 'DATETIMESLOT':
        let mirror = this.state.columnComponentType =='DATETIMESLOTMIRROR'?true:false;
        let dateSlotSummary = data.getBoardDateSlotSummary(columnKey,spanText,mirror);
        let slotDateStyle = {
          borderRadius:dateSlotSummary.borderRadius,
          width:dateSlotSummary.width
        }
        summaryCell = (
          <Fragment>
              <div className="board_summary_cell">
                  <div className="dateTimeSlotCell">
                    <div className="dateTimeSlotCell_Warper2" style={slotDateStyle}></div>
                    <div className="dateTimeSlotCell_Warper">
                      <div className="date_field_div">
                        <div className="start_date_left">
                          {dateSlotSummary.startMinDate}
                        </div>
                    </div>
                    <div className="date_field_split">-</div>
                    <div className="date_field_div">
                        <div className="end_date_right">
                          {dateSlotSummary.endMaxDate}
                        </div>
                      </div>
                    </div>
                </div>
              </div>
          </Fragment>
        );
        break;

      case 'STATUS':
        // 状态列:获取每个状态占的百分比
        // let statusPercent = data.getBoardStatusSummary(columnKey);
        let statusPercent = this.state.BoardStatusSummary;
        summaryCell = (
          <div className="board_summary_cell">
            {board&&(!getTodoBoardFlag(board.boardType))&&<div className="summary_cell_status_container">
              {statusPercent.map((status,index) => {
                const statusText = status.style.statusName;
                let tooltipText = statusText+" "+status.style.fraction+"   "+status.style.width;
                return <Tooltip placement="top" key={index} title={tooltipText} arrowPointAtCenter>
                    <div key={status.style.background} className="status_summary" style={status.style} />
                  </Tooltip>;
              })}
            </div>}
          </div>
        );
        break;

      case 'DATE':
        // 日期列: 获取最小和最大日期及相差天数
        let dateSummary = data.getBoardDateSummary(columnKey,dateText);
        const radioStyle = {
          display: 'block',
          height: '30px',
          lineHeight: '30px',
        };

        summaryCell = (
          <Fragment>
            <Popover
              ref={this.popoverRef}
              placement="leftBottom"
              trigger="click"
              autoAdjustOverflow={false}
              getPopupContainer={(trigger) => this.props.container ? this.props.container : trigger.parentElement}
              onVisibleChange={this.handleVisibleChange}
              content={
                <Radio.Group
                  style={{marginLeft: 4, pointerEvents: 'visible'}}
                  onChange={this.handleRadioChange}
                  value={dateSummary.summaryRule}
                >
                  <Radio style={radioStyle} value={DateCellSummaryRule.EARLIEST.key}>
                    {t('ColumnCell.DateCell.earliest_time')}
                  </Radio>
                  <Radio style={radioStyle} value={DateCellSummaryRule.LATEST.key}>
                    {t('ColumnCell.DateCell.Latest_time')}
                  </Radio>
                </Radio.Group>
              }
            >
              <div className="board_summary_cell">
                <div className="summary_cell_date_container">
                  {/* {dateSummary.dateDiff ? (
                  <div
                    style={{
                      background: `linear-gradient(to right, ${color} ${dateSummary.datePercent}, rgb(28, 31, 59) ${dateSummary.datePercent})`,
                    }}
                  >
                    <span
                      className="summary_cell_date_container_span"
                      contents={dateSummary.dateText}
                      hovercontents={dateSummary.dateDiff}
                    />
                  </div>
                ) : (
                  <span className="summary_cell_date_container_span">{dateSummary.dateText}</span>
                )} */}
                  {dateSummary.dateText2 ? (
                    <Fragment>
                      <div className="summary_cell_date_container_rule">{dateSummary.dateText1}</div>
                      <div className="summary_cell_date_container_text">{dateSummary.dateText2}</div>
                    </Fragment>
                  ) : null}
                </div>
              </div>
            </Popover>
          </Fragment>
        );
        break;

      default:
        summaryCell = <div className="default_summary_cell" style={summary_cell_background} />;
        break;
    }
    if (column && column.isTitle) {
      summaryCell = (
        <div className="board_summary_cell" >
          <div className="summary_cell_status_container">
            <div style={total_style}>
              <span style={title_style}>{t('ColumnCell.SummaryCell.total_count')}：</span>
              <span style={count_style}>{t('ColumnCell.SummaryCell.total')}{total}{t('ColumnCell.SummaryCell.item')}</span>
            </div>
          </div>
        </div>
      );
    } else if (column && column.columntype === 'ROWACTION') {
      summaryCell = <div className="default_summary_cell" style={{summary_cell_top_border}} />;
    }
    return summaryCell;
  };

  render() {
    const {data, rowIndex} = this.props;
    const group = data.getGroupByRowIndex(rowIndex);
    if(group){
      return this.getSummaryCell();
    }else{
      return this.getBoardSummaryCell();
    }
    
  }
}

export default SummaryCell;
