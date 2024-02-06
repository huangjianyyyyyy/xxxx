import React from 'react';
import {  withTranslation } from 'react-i18next';
import './LinkSourceCell.less';
import './LinkStatusCell.less';
import { Badge, Timeline, Popover, Tooltip } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { TaskColumns } from '../taskcolumns/TaskColumns';
import { RowHeaderLinkCell } from '../../RowHeaderLinkCell';
import FixedDataTableCellDefault from '../../../maintable/FixedDataTableCellDefault';
import { ColumnType,ModalTypes } from '../../../maintable/data/MainTableType';
// import { parseBoardViewId } from '../../../maintable/data/MainTableType';

@withTranslation()
class LinkSourceCell extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // items: [],
      // boardId: props.value,
      version: 0,
      isLoading: true,
      showPopover: false,
      // version: props.version,
    };
    this._initialized = false;
  }

  componentDidMount() {
    let rowData = this.props.data.getObjectAt(this.props.rowIndex);
    const value =rowData && rowData[TaskColumns.Column_Subtask];
    if (!this.props.value && !this._initialized) {
      if (value) {
        // this.setState({isLoading: true, boardId: value});
        this.props.data._dataset.listUpBoards(value.value, this.callback);
        console.log('reload source');
      } else if (this.props.data.getGroupId(this.props.rowIndex) > '1') {
        // this.setState({isLoading: true});
        this.props.data._dataset.listUpBoardsByRowID(this.props.data.getRowKey(this.props.rowIndex), this.callback1);
        console.log('reload source');
      } else {
        this.props.data.setObjectAt(this.props.rowIndex, this.props.columnKey, [], true);
      }
    }
    this._initialized = true;
  }

  componentWillUnmount() {
    this._initialized = false;
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (this.props.value) {
  //     if (this.state.boardId) {
  //       if (prevState.boardId !== this.state.boardId || (this.props.version !== prevProps.version && !prevState.isLoading)) {
  //         this.props.data._dataset.listUpBoards(this.state.boardId, this.callback);
  //       }
  //     } else if (this.state.isLoading && this.props.version !== prevProps.version && !prevState.isLoading) {
  //         if (this.props.data.getGroupId(this.props.rowIndex) > '1') {
  //           this.props.data._dataset.listUpBoardsByRowID(this.props.data.getRowKey(this.props.rowIndex), this.callback);
  //         }
  //     }
  //   }
  // }

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   const value = nextProps.data.getObjectAt(nextProps.rowIndex)[TaskColumns.Column_Subtask];
  //   // if (!value) {
  //   //     return {items: []};
  //   // }
  //   if (value !== prevState.boardId || nextProps.version !== prevState.version) {
  //       return {
  //         isLoading: true,
  //         boardId: value,
  //         version: nextProps.version
  //       };
  //   }
  //   return {isLoading: false};
  // }

  //callback for subtask.
  callback = (items) => {
    //const value = this.props.data.getObjectAt(this.props.rowIndex)[TaskColumns.Column_Subtask];
    if (!items || items.length < 1) {
      this.setState({
        isLoading: false,
      });
      return;
    }
    items.shift();

    let ts = items.reverse();
    this.props.data.setObjectAt(this.props.rowIndex, this.props.columnKey, ts, true);
  }

  //callback from row.
  callback1 = (items) => {
    //const value = this.props.data.getObjectAt(this.props.rowIndex)[TaskColumns.Column_Subtask];
    if (!items || items.length < 1) {
      this.setState({
        isLoading: false,
      });
      return;
    }

    let ts = items.reverse();
    this.props.data.setObjectAt(this.props.rowIndex, this.props.columnKey, ts, true);
  }

  _renderCell = (
    /*number*/ i,
    /*number*/ rowIndex,
    /*number*/ rowKey,
    /*object*/ cellTemplate,
    /*key*/ columnKey
  ) /*object*/ => {
    let cellProps = {
      columnKey,
      onCellEdit: null,
      onCellEditEnd: null,
      container: this.props.container,
      data: this.state.data,
      rowIndex,
      rowKey,
    };

    let content;
    if (React.isValidElement(cellTemplate)) {
      content = React.cloneElement(cellTemplate, cellProps);
    } else if (typeof cellTemplate === 'function') {
      content = new cellTemplate(cellProps);
    } else {
      content = <FixedDataTableCellDefault {...cellProps}>{cellTemplate}</FixedDataTableCellDefault>;
    }

    let group = this.state.data.getGroupByRowIndex(rowIndex);
    let groupColor = group ? group.color : '#f1f3f5';
    let css_style = {
      borderLeft: '3px solid ' + groupColor,
    };
    return (
      <div className="link_row_wrapper" key={i} style={css_style}>
        <div className="link_row_component_wrapper">{content}</div>
      </div>
    );
  }

  handleChangeVisible = (visible) => {
    this.setState({ showPopover: visible });
    // 消失时保存数据
    if (!visible) {
      this.props.handleCellEditEnd();
    } else {
      this.props.handleCellEdit(ColumnType.SUBTASKSOURCE);
    }
  };

  getTimelineItem = (count, value, rowKey, externalLink, boardId) => {
    return (
      <Timeline.Item key={count} dot={count === 0 && <EnvironmentOutlined style={{ fontSize: '20px' }} />}>
        <div className="link_row_wrapper">
          <div className="link_row_component_wrapper">
            <RowHeaderLinkCell
              value={value}
              data={this.props.data}
              rowIndex={0}
              rowKey={rowKey}
              boardId={boardId}
              externalLink={externalLink}
              dataVersion={0}
              type={'TEXT'}
              width={220}
              height={32}
              columnKey={TaskColumns.Column_Description}
              onCellEdit={this.props.onCellEdit}
              onCellEditEnd={this.props.onCellEditEnd}
              container={this.props.container}
            />
          </div>
        </div>
      </Timeline.Item>
    );
  }

  handleCellFocus = (focused) => {
    if (this.props.onCellFocus) {
        this.props.onCellFocus(
        this.props.rowIndex,
        this.props.columnKey,
        focused
        );
    }
  }

  render() {
    const { t } = this.props;
    const items = this.props.value;
    const width = 280;
    let modalType = this.props.modalType==ModalTypes.RELATION?true:false;
    if (!items || items.length === 0) {
      return null;
    }

    const handleCellEnter = () => {
      if (this.handleCellFocus) {
        this.handleCellFocus(true);
      }
    };

    const handleCellLeave = () => {
      if (this.handleCellFocus) {
        this.handleCellFocus(false);
      }
    };

    let count = 0;
    let cellItems = [];
    let tooltipText;
    let lastDesc;
    let isSkipFirst = false;
    if (!items[0].rowID && items[0].board.externallink) {
      let pmsItems = JSON.parse(items[0].board.externallink).paramData;
      // 放入PMS Object Parent Object
      pmsItems.map((item) => {
        if (!item.rootObjectId) return null;
        cellItems.push(this.getTimelineItem(count, null, null, item, null));
        count++;
      });

      // 下次循环跳过第一条数据
      isSkipFirst = true;

      if (count > 0) {
        tooltipText = pmsItems[0].rootObjectName;

        // 无Pynbo的溯源数据
        if (items.length === 0 && count > 1) {
          lastDesc = pmsItems[pmsItems.length - 1].rootObjectName;
        }
      }

      // 放入PMS Object
      // cellItems.push(this.getTimelineItem(count, item[0].board.name, null, null, null));
      // count++;
    }

    if (count === 0 && items.length > 0) {
      tooltipText = items[0].board.name;
    }

    // 放入Pynbo Object
    items.map((item, i) => {
      if (isSkipFirst && i == 0) return null;
      cellItems.push(this.getTimelineItem(count, item.board.name, item.rowID, null, item.board.id));
      count++;
    });

    if (!lastDesc && items.length > 0) {
      lastDesc = items[items.length - 1].board.name;
    }

    let content = [];
    content.push(<div className={count > 1 ? 'left_div_content' : 'div_content_one'}>{tooltipText}</div>);
    if (count > 1) {
      content.push(<div className="middle_div_content">{'...>>'}</div>);
      tooltipText += '>>...>>' + lastDesc;
      content.push(
        <div className="right_div_content">
          <Badge count={count} className="site-badge-count-4"></Badge>
        </div>
      );
    }

    return (
      <div className="source_cell_container">
        <Popover
          disabled={modalType}
          placement="bottomRight"
          trigger="click"
          destroyTooltipOnHide="true"
          autoAdjustOverflow={false}
          onVisibleChange={this.handleChangeVisible}
          getPopupContainer={(trigger) => (this.props.container ? this.props.container : trigger.parentElement)}
          content={
            <div
              style={{ pointerEvents: 'visible', width }}
              onMouseEnter={handleCellEnter}
              onMouseLeave={handleCellLeave}
            >
              <div className="rows_scroll" style={items.length === 5 ? { overflowY: 'scroll' } : {}}>
                <Timeline style={{ paddingLeft: '20px', paddingRight: '20px' }}>{cellItems}</Timeline>
              </div>
            </div>
          }
          title={
            <div style={{ pointerEvents: 'visible', width }}>
              <div
                style={{
                  paddingLeft: '20px',
                  paddingRight: '20px',
                  paddingTop: '8px',
                  display: 'flex',
                  flexWrap: 'wrap',
                }}
              >
                {t('Column.Column_Traceback')}
              </div>
            </div>
          }
        >
          {items && (
            <Tooltip title={tooltipText} destroyTooltipOnHide="true">
              <div className="div_content">{content}</div>
            </Tooltip>
          )}
        </Popover>
      </div>
    );
  }
}

export { LinkSourceCell };
