import React from 'react';
import { withTranslation } from 'react-i18next';
import { Cell } from '../../../maintable/FixedDataTableRoot';
import { CaretDownOutlined, SettingFilled } from '@ant-design/icons';
import { Tooltip,  message, Dropdown,Tag } from 'antd';
import { connect } from 'react-redux';
import './LinkCell.less';
import RelationModal from '../../section/modal/RelationModal';
import { CredentialContext } from '../../../CredentialContext';
import { parseBoardViewId, ModalTypes } from '../../../maintable/data/MainTableType';
import LinkBoardSelectModal from '../../section/modal/LinkBoardSelectModal';
import { changeIsAllFlag } from '../../../maintable/actions/rowActions';
function getLinkBoardRows(value) {
  let LinkBoardRows = [];
  if (value && Array.isArray(value)) {
    value.map((item) => {
      LinkBoardRows.push(item.value);
    });
  }
  return LinkBoardRows;
}
@withTranslation()
@connect(null, { changeIsAllFlag })
class LinkBoardCell extends React.PureComponent {
  static contextType = CredentialContext;
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      linkModalVisible: false,
      version: props.version,
      isLinkBoardSelectModal: false,
      linkBoardId: '',
      linkBoardName: '',
      linkMirrorColumnId: null,
      boardName: '',
      LinkBoardRows: [],
      value: props.value,
      rowIndex: props.rowIndex,
      showModalType: true,
      isMultiline: true,
      linkedBoardMulti: [],
      onKeyCreateLoading: false,
    };
  }

  componentDidMount() {
    const { data, rowIndex } = this.props;
    let rowId = data.getRowKey(rowIndex);
    this.setState({
      rowId: rowId,
    });
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    let { data, rowIndex, columnKey } = nextProps;
    let value;
    let rowData = data.getObjectAt(rowIndex);
    let rowId = data.getRowKey(rowIndex);
    if (rowData && rowData[columnKey]) {
      value = rowData[columnKey].value;
    }
    if (
      rowIndex != prevState.rowIndex ||
      prevState.value != value ||
      rowId != prevState.rowIndex
    ) {
      if (nextProps.isSingle) {
        return {
          value: value,
          LinkBoardRows: getLinkBoardRows(value),
          rowIndex: rowIndex,
          rowId: rowId,
        };
      } else {
        return {
          value: value,
          linkBoardName: value,
          rowIndex: rowIndex,
          rowId: rowId,
        };
      }
    }
    return null;
  }

  setLoading = (isLoading) => {
    this.setState({
      isLoading: isLoading,
    });
  };

  getColumnLinkToBoard = (columnKey) => {
    let result;
    const { data, isSingle } = this.props;
    if (isSingle) {
      result = data._dataset.getColumnLinkToBoardById(columnKey);
    } else {
      data._dataset.getLinkedBoardMulti(data._boardId, columnKey).then((res) => {
        let linkedBoardMulti = [];
        if (res && res.items && res.items.length > 0) {
          linkedBoardMulti = res.items.map((item) => {
            return item.linkBoardID;
          });
        }
        this.setState({
          linkedBoardMulti: linkedBoardMulti,
        });
      });

      result = data._dataset.getColumnLinkToBoardByRowId(
        data._boardId,
        this.state.rowId,
        columnKey
      );
    }
    return result;
  };

  setMenus = (menus, isBoard, defaultBoard) => {
    let boardTitle;
    let boardColor;
    let boardId;
    if (defaultBoard) {
      boardTitle = defaultBoard.name;
      boardColor = defaultBoard.color;
      boardId = defaultBoard.boardId;
    }
    this.setState({
      boardTitle,
      boardColor,
      boardId,
      isLoading: false,
      board: defaultBoard,
    });
  };

  openLinkModal = (event) => {
    const {
      modalType,
      handleUpdateModal,
      data,
      rowIndex,
      columnKey,
      isSingle,
      value,
      navigateBoardCallback,
      isReadonly,
      handleCellFocus,
    } = this.props;
    let LinkBoardRows = this.state.LinkBoardRows;
    if (modalType == ModalTypes.RELATION && handleUpdateModal) {
      handleUpdateModal(true, data, rowIndex, null, true);
      return;
    }

    this.getColumnLinkToBoard(columnKey).then((res) => {
      if (!res || !LinkBoardRows) {
        if (isReadonly) {
          message.warning('暂无编辑权限');
          return;
        }
        this.setState({
          showModalType: true,
        });
        this.onShowBoardModal(true);
        return;
      }

      let bv = parseBoardViewId(res.linkBoardID);
      if (navigateBoardCallback) {
        navigateBoardCallback(
          data._boardId,
          value,
          false,
          data,
          rowIndex,
          columnKey,
          isSingle
        );
        this.setState({
          linkModalVisible: true,
          linkBoardId: bv.boardId + '-' + bv.viewId,
          isMultiline: res.isMultiline === undefined ? true : res.isMultiline,
        });
        return;
      }
      this.setState({
        linkModalVisible: true,
        linkBoardId: bv.boardId + '-' + bv.viewId,
        isMultiline: res.isMultiline === undefined ? true : res.isMultiline,
        isTwoWayLink: res.isTwoWayLink,
      });
      if (handleCellFocus) {
        handleCellFocus(true);
      }
    });
  };

  linkModalClosed = () => {
    this.setState({ linkModalVisible: false });
    if (this.props.onCellFocus) {
      this.props.onCellFocus(false);
    }
  };

  onShowBoardModal = (value, linkBoardName, type) => {
    this.setState({
      isLinkBoardSelectModal: value,
    });
    if (!this.props.isSingle && linkBoardName) {
      if (this.props.data && this.props.data._rowKey) {
        this.props.data.setObjectAt(
          this.props.rowIndex,
          this.props.columnKey,
          linkBoardName,
          true
        );
      }
      this.setState({
        linkBoardName: linkBoardName,
      });
    }
    if (type) {
      this.openLinkModal();
    }
  };

  openSetModal(event) {
    const { modalType, isReadonly, data, columnKey } = this.props;
    if (modalType == ModalTypes.RELATION || isReadonly) {
      message.warning('暂无权限');
      return;
    }
    event.stopPropagation();
    this.getColumnLinkToBoard(columnKey).then((res) => {
      if (res && !!res.linkBoardID) {
        let bv = parseBoardViewId(res.linkBoardID);
        this.setState({
          showModalType: false,
          linkBoardId: bv.boardId + '-' + bv.viewId,
          isTwoWayLink: res.isTwoWayLink,
          isMultiline: res.isMultiline,
        });
      } else {
        this.setState({
          showModalType: true,
        });
      }
      this.onShowBoardModal(true);
    });
  }

  handleDropdownClick = (open) => {
    const { onCellEdit, rowIndex, columnKey, onCellEditEnd } = this.props;
    if (open) {
      onCellEdit && onCellEdit(rowIndex, columnKey, 200);
    } else {
      onCellEditEnd && onCellEditEnd(rowIndex, columnKey);
    }
  };

  handleAttribute = (e, item) => {
    const { handleUpdateModal, data } = this.props;
    e.stopPropagation();
    if (handleUpdateModal) {
      handleUpdateModal(true, data, item.rowId, true);
    }
  };

  DropMenu = () => {
    const { value } = this.state;
    return (
      <div>
        {value &&
          value.map((item) => (
            <Tag closable onClick={(e) => this.handleAttribute(e, item)}>
              <span className='LinkCell-tag'>{item.value}</span>
            </Tag>
          ))}
        <CaretDownOutlined className='openModal-Icon' onClick={this.openLinkModal} />
      </div>
    );
  };

  oneKeyCreate = () => {
    const { data, rowIndex, columnKey } = this.props;
    const boardId = data._boardId;
    const rowId = data.getRowKey(rowIndex);
    const rowData = data.getObjectAt(rowIndex);
    let rowDataObj = {};
    for (let key in rowData) {
      const columnObj = rowData[key];
      if (columnObj && columnObj.column) {
        if (columnObj.column.agelilevel === 1004) {
          rowDataObj.projectType = data.getSelectOptionsText(
            columnObj.value,
            columnObj.column.columnKey
          ).LinkedBoardID;
        } else if (columnObj.column.agelilevel === 1002) {
          rowDataObj.projectNumber = columnObj.value;
        } else if (columnObj.column.agelilevel === 1001) {
          rowDataObj.projectName = columnObj.value;
        } else if (columnObj.column.agelilevel === 1005) {
          rowDataObj.templateID = data.getSelectOptionsText(
            columnObj.value,
            columnObj.column.columnKey
          ).LinkedBoardID;
        } else if (columnObj.column.agelilevel === 1003) {
          const usersArray = columnObj.value;
          let userId = [];
          usersArray.forEach((user) => {
            userId.push(user.id);
          });
          rowDataObj.projectPerson = userId.toString();
        }
      }
    }
    this.setState({
      onKeyCreateLoading: true,
    });
    data._dataset
      .oneKeyCopyBoardTemplate(boardId, rowId, columnKey, rowDataObj)
      .then((res) => {
        if (res) {
          let bv = parseBoardViewId(boardId);
          let column = data._dataset.getColumn(boardId, columnKey);
          column && (column.isOnekey = false);
          this.setState({
            onKeyCreateLoading: false,
          });
        } else {
          message.error('创建失败！');
          this.setState({
            onKeyCreateLoading: false,
          });
        }
      });
  };

  render() {
    const {
      data,
      columnKey,
      rowIndex,
      siderWidth,
      isCellSelected,
      t,
      width,
      modalType,
      isSingle,
      isReadonly,
    } = this.props;
    const {
      linkModalVisible,
      isLinkBoardSelectModal,
      showModalType,
      linkBoardName,
      LinkBoardRows,
      isMultiline,
      rowId,
      linkedBoardMulti,
      isTwoWayLink,
      value,
    } = this.state;
    const header = rowIndex ? data.getLinkRowHeader(rowIndex) : '';
    const columns = data._dataset._columns[data._boardId];
    const column = columns.find((c) => c.columnKey === columnKey);
    const isOnekey = column && column.isOnekey;
    let content;
    let newColumn = {
      columnKey: columnKey,
    };
    let relationBoardRows = true;
    if (isSingle && LinkBoardRows) {
      // 按钮文字宽度 = 列宽 - 按钮Padding(20px) - 图标固定宽度(20px) - 单元格Padding(10px)
      if (LinkBoardRows) {
        // onClick={this.openLinkModal.bind(this)}
        //     content = (
        //       <Button type='link'>
        //         <div style={{ maxWidth: width - 50 }} className='link_cell_btn_text' key={0}>
        //           {LinkBoardRows[0]}
        //         </div>
        //       </Button>
        //     );
        //   } else if (LinkBoardRows.length > 1) {
        //     content = (
        //       <Button type='link'>
        //         <div style={{ maxWidth: width - 50 }} className='link_cell_btn_text'>
        //           {LinkBoardRows.length + t('Menu.item')}
        //         </div>
        //       </Button>
        //     );
        content = (
          <div>
            {value &&
              value.map((item) => (
                <Tag className='LinkCell-content-tag'>
                  <span>{item.value}</span>
                </Tag>
              ))}
          </div>
        );
      } else {
        relationBoardRows = false;
      }
    }
    return (
      <Cell className='LinkCell' isCellSelected={isCellSelected}>
        <Dropdown
          overlay={this.DropMenu()}
          placement='bottomLeft'
          trigger={['click']}
          overlayClassName='LinkCell-Dropdown'
          onVisibleChange={this.handleDropdownClick}
          className='LinkCell-Dropdown-wrap'
        >
          <div onClick={(e) => e.stopPropagation()}>
            <div
              className='LinkCell_list_center'
              style={{ width }}
              // onClick={!isOnekey && this.openLinkModal.bind(this)}
            >
              {/* <div className={!isReadonly && relationBoardRows && !isOnekey && "link_cell_icon"} >
                        {!isReadonly && !isOnekey && <PlusCircleFilled className={modalType==ModalTypes.RELATION?"relation_add_icon":"LinkCell_link_add_icon"}  />}
                        {!isReadonly && !relationBoardRows && isOnekey && 
                        <Button size="small" onClick={this.oneKeyCreate} loading={onKeyCreateLoading}>
                            一键创建
                        </Button>
                        }
                    </div> */}
              {isSingle && LinkBoardRows && LinkBoardRows.length > 0 && (
                <Tooltip
                  placement={'topLeft'}
                  title={LinkBoardRows.map((row, i) => {
                    if (i < 4) {
                      return <div key={i}>{row}</div>;
                    } else if (i == 4) {
                      return (
                        <div key={i}>
                          {'+' + (LinkBoardRows.length - 4) + t('Menu.item')}
                        </div>
                      );
                    }
                  })}
                >
                  {content}
                </Tooltip>
              )}
              {!isSingle && (
                <Tooltip title={linkBoardName}>
                  <div className='text_cell_name'>{linkBoardName}</div>
                </Tooltip>
              )}
              {!isSingle && !!linkBoardName && !isReadonly && (
                <div className='link_cell_icon'>
                  <SettingFilled
                    className='LinkCell_link_add_icon'
                    style={{ color: '#666' }}
                    onClick={this.openSetModal.bind(this)}
                  />
                </div>
              )}
            </div>
          </div>
        </Dropdown>
        <RelationModal
          isMultiline={isMultiline}
          isSingle={isSingle}
          rowId={rowId}
          isShowRelationModal={linkModalVisible}
          data={data}
          columnKey={columnKey}
          columnName={column && column.name}
          rowIndex={rowIndex}
          header={header}
          onClosed={this.linkModalClosed}
          boardId={data._boardId}
          relationBoardId={this.state.linkBoardId}
          siderWidth={siderWidth}
          isReadonly={isReadonly}
          RelationNavigateBoard={this.props.RelationNavigateBoard}
        />

        {
          <LinkBoardSelectModal
            isMultiline={isMultiline}
            isSingle={isSingle}
            rowId={rowId}
            isLinkBoardSelectModal={isLinkBoardSelectModal}
            boardId={data._boardId}
            linkBoardId={this.state.linkBoardId}
            data={data._dataset}
            newColumn={newColumn}
            columnKey={columnKey}
            onCloseBoardModal={this.onShowBoardModal}
            showModalType={showModalType}
            rowViewData={data}
            linkMirrorColumnId={this.state.linkMirrorColumnId}
            linkBoardName={linkBoardName}
            linkedBoardMulti={linkedBoardMulti}
            preIsTwoWayLink={isTwoWayLink}
          />
        }
      </Cell>
    );
  }
}

export { LinkBoardCell };
